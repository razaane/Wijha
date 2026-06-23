<?php

namespace Modules\Booking\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Booking\Models\Message;
use Modules\Booking\Models\Booking;
use Modules\Core\Traits\ApiResponse;

class MessagesController extends Controller
{
    use ApiResponse;

    /**
     * Get all active message threads for the user (grouped by booking).
     */
    public function threads()
    {
        $userId = Auth::id();

        // Get all bookings where the user is either the guest or the host
        $bookings = Booking::with(['listing', 'user'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhereHas('listing', function ($q) use ($userId) {
                          $q->where('user_id', $userId);
                      });
            })
            ->whereHas('messages') // Only bookings that have messages
            ->get()
            ->map(function ($booking) use ($userId) {
                $latestMessage = Message::where('booking_id', $booking->id)
                    ->latest()
                    ->first();

                $unreadCount = Message::where('booking_id', $booking->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();
                
                // Determine the "other person"
                $isHost = $booking->listing->user_id === $userId;
                $otherPerson = $isHost ? $booking->user : \App\Models\User::find($booking->listing->user_id);

                return [
                    'booking_id' => $booking->id,
                    'listing' => [
                        'id' => $booking->listing->id,
                        'title' => $booking->listing->title,
                        'photo' => $booking->listing->photos?->first()?->original_url ?? null
                    ],
                    'other_person' => [
                        'id' => $otherPerson->id,
                        'name' => $otherPerson->name,
                        'avatar' => $otherPerson->avatar
                    ],
                    'latest_message' => $latestMessage ? $latestMessage->content : null,
                    'latest_message_time' => $latestMessage ? $latestMessage->created_at : null,
                    'unread_count' => $unreadCount
                ];
            })
            ->sortByDesc('latest_message_time')
            ->values();

        return $this->successResponse($bookings, 'Threads retrieved successfully.');
    }

    /**
     * Get messages for a specific booking thread.
     */
    public function show($bookingId)
    {
        $userId = Auth::id();

        // Verify access to this booking thread
        $booking = Booking::with('listing')->findOrFail($bookingId);
        
        if ($booking->user_id !== $userId && $booking->listing->user_id !== $userId) {
            return $this->errorResponse('unauthorized', 'You do not have access to this thread.', 403);
        }

        // Mark all as read
        Message::where('booking_id', $bookingId)
            ->where('receiver_id', $userId)
            ->update(['is_read' => true]);

        $messages = Message::where('booking_id', $bookingId)
            ->with(['sender:id,name,avatar'])
            ->orderBy('created_at', 'asc')
            ->get();

        return $this->successResponse($messages, 'Messages retrieved.');
    }

    /**
     * Send a new message.
     */
    public function store(Request $request, $bookingId)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $userId = Auth::id();
        $booking = Booking::with('listing')->findOrFail($bookingId);

        if ($booking->user_id !== $userId && $booking->listing->user_id !== $userId) {
            return $this->errorResponse('unauthorized', 'You do not have access to this thread.', 403);
        }

        // Determine receiver
        $receiverId = ($booking->user_id === $userId) ? $booking->listing->user_id : $booking->user_id;

        $message = Message::create([
            'booking_id' => $bookingId,
            'sender_id' => $userId,
            'receiver_id' => $receiverId,
            'content' => $validated['content'],
            'is_read' => false
        ]);

        $message->load('sender:id,name,avatar');

        // Dispatch WebSocket event
        event(new \App\Events\MessageSent($message));

        return $this->successResponse($message, 'Message sent.', 201);
    }
}
