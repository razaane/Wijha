<?php

namespace Modules\Message\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function unreadCount(Request $request)
    {
        $user = auth()->user();
        
        $role = $request->input('role'); // 'host' or 'guest' or null

        $query = \Modules\Message\Models\Message::where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->whereHas('conversation', function($q) use ($user, $role) {
                if ($role === 'host') {
                    $q->where('host_id', $user->id);
                } elseif ($role === 'guest') {
                    $q->where('guest_id', $user->id);
                } else {
                    $q->where(function($sq) use ($user) {
                        $sq->where('host_id', $user->id)->orWhere('guest_id', $user->id);
                    });
                }
            });

        $count = $query->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'count' => $count
            ]
        ]);
    }
    public function send(Request $request)
    {
        $request->validate([
            'conversation_id' => 'nullable|exists:conversations,id',
            'host_id' => 'required_without:conversation_id|exists:users,id',
            'listing_id' => 'nullable|exists:listings,id',
            'message' => 'nullable|string',
            'attachment' => 'nullable|image|max:5120', // 5MB max
            'reply_to_id' => 'nullable|exists:conversation_messages,id'
        ]);

        $user = auth()->user();

        if ($request->conversation_id) {
            $conversation = \Modules\Message\Models\Conversation::findOrFail($request->conversation_id);
            // Verify user is part of the conversation
            if ($conversation->host_id !== $user->id && $conversation->guest_id !== $user->id) {
                return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
            }
        } else {
            // Prevent messaging self
            if ($user->id == $request->host_id) {
                return response()->json(['status' => 'error', 'message' => 'You cannot message yourself'], 400);
            }

            // Find existing conversation bidirectionally
            $conversation = \Modules\Message\Models\Conversation::where('listing_id', $request->listing_id)
                ->where(function ($query) use ($user, $request) {
                    $query->where(function ($q) use ($user, $request) {
                        $q->where('guest_id', $user->id)->where('host_id', $request->host_id);
                    })->orWhere(function ($q) use ($user, $request) {
                        $q->where('guest_id', $request->host_id)->where('host_id', $user->id);
                    });
                })->first();

            if (!$conversation) {
                $conversation = \Modules\Message\Models\Conversation::create([
                    'guest_id' => $user->id,
                    'host_id' => $request->host_id,
                    'listing_id' => $request->listing_id,
                ]);
            }
        }

        $attachmentUrl = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('messages/attachments', 'public');
            $attachmentUrl = $path;
        }

        if (empty($request->message) && !$attachmentUrl) {
            return response()->json(['status' => 'error', 'message' => 'Message or attachment is required'], 422);
        }

        $message = \Modules\Message\Models\Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'text' => $request->message,
            'attachment_url' => $attachmentUrl,
            'reply_to_id' => $request->reply_to_id,
        ]);

        // Load relationships for broadcasting
        $message->load(['sender', 'replyTo']);
        
        event(new \Modules\Message\Events\ConversationMessageSent($message, $conversation->id));

        return response()->json([
            'status' => 'success',
            'data' => [
                'conversation_id' => $conversation->id,
                'message' => $message
            ]
        ]);
    }

    public function conversations(Request $request)
    {
        $user = auth()->user();
        
        $query = \Modules\Message\Models\Conversation::with(['host', 'guest', 'listing', 'messages' => function($q) {
            $q->latest()->limit(1);
        }]);

        if ($request->input('role') === 'host') {
            $query->where('host_id', $user->id);
        } elseif ($request->input('role') === 'guest') {
            $query->where('guest_id', $user->id);
        } else {
            $query->where(function($q) use ($user) {
                $q->where('host_id', $user->id)->orWhere('guest_id', $user->id);
            });
        }

        $conversations = $query->orderByDesc('updated_at')->get();

        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }

    public function messages(Request $request, $id)
    {
        $user = auth()->user();
        $conversation = \Modules\Message\Models\Conversation::with(['host', 'guest', 'listing'])->findOrFail($id);

        if ($conversation->host_id !== $user->id && $conversation->guest_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        if ($request->input('role') === 'host' && $conversation->host_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized role'], 403);
        }

        if ($request->input('role') === 'guest' && $conversation->guest_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized role'], 403);
        }

        $messages = \Modules\Message\Models\Message::with(['sender', 'replyTo', 'reactions'])
            ->where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread as read if the current user didn't send them
        \Modules\Message\Models\Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'conversation' => $conversation,
                'messages' => $messages
            ]
        ]);
    }

    public function react(Request $request, $id)
    {
        $request->validate([
            'emoji' => 'required|string|max:10'
        ]);

        $message = \Modules\Message\Models\Message::findOrFail($id);
        
        // Ensure user is part of the conversation
        $conversation = $message->conversation;
        $user = auth()->user();
        if ($conversation->host_id !== $user->id && $conversation->guest_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        $reaction = \Modules\Message\Models\MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->first();

        if ($reaction) {
            if ($reaction->emoji === $request->emoji) {
                // Toggle off
                $reaction->delete();
            } else {
                // Update emoji
                $reaction->update(['emoji' => $request->emoji]);
            }
        } else {
            // Create new
            \Modules\Message\Models\MessageReaction::create([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'emoji' => $request->emoji
            ]);
        }

        return response()->json(['status' => 'success']);
    }
}
