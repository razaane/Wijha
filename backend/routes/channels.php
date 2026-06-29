<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['api', 'auth:api'], 'prefix' => 'api/v1']);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('booking.{bookingId}', function ($user, $bookingId) {
    return true; // Simplify for now; booking logic is handled in controller
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \Modules\Message\Models\Conversation::find($conversationId);
    if (!$conversation) return false;
    return $conversation->host_id === $user->id || $conversation->guest_id === $user->id;
});
