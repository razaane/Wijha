<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('booking.{bookingId}', function ($user, $bookingId) {
    $booking = \Modules\Booking\Models\Booking::with('listing')->find($bookingId);
    if (!$booking) return false;
    
    // Only the guest or the host can listen to this channel
    return (int) $user->id === (int) $booking->user_id || (int) $user->id === (int) $booking->listing->user_id;
});
