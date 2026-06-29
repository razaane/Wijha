<?php

namespace Modules\Message\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $conversationId;

    /**
     * Create a new event instance.
     */
    public function __construct($message, $conversationId)
    {
        $this->message = $message;
        $this->conversationId = $conversationId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Load conversation if not already loaded to get host and guest IDs
        if (!$this->message->relationLoaded('conversation')) {
            $this->message->load('conversation');
        }

        $channels = [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];

        if ($this->message->conversation) {
            $channels[] = new PrivateChannel('App.Models.User.' . $this->message->conversation->host_id);
            $channels[] = new PrivateChannel('App.Models.User.' . $this->message->conversation->guest_id);
        }

        return $channels;
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message
        ];
    }
}
