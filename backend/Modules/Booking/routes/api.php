<?php

use Illuminate\Support\Facades\Route;
use Modules\Booking\Http\Controllers\BookingController;

/*
|--------------------------------------------------------------------------
| Booking Module API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/bookings
|
*/

Route::prefix('v1/bookings')->middleware('auth:api')->group(function () {
    Route::get('/', [BookingController::class, 'index'])->name('booking.index');
    Route::post('/', [BookingController::class, 'store'])->name('booking.store');
    Route::get('/{id}', [BookingController::class, 'show'])->name('booking.show');
    Route::put('/{id}', [BookingController::class, 'update'])->name('booking.update');
    Route::delete('/{id}', [BookingController::class, 'destroy'])->name('booking.destroy');

    // Messaging Routes
    Route::get('/messages/threads', [\Modules\Booking\Http\Controllers\MessagesController::class, 'threads'])->name('booking.messages.threads');
    Route::get('/{id}/messages', [\Modules\Booking\Http\Controllers\MessagesController::class, 'show'])->name('booking.messages.show');
    Route::post('/{id}/messages', [\Modules\Booking\Http\Controllers\MessagesController::class, 'store'])->name('booking.messages.store');

    // Scanning Routes
    Route::post('/scan', [BookingController::class, 'scanTicket'])->name('booking.scan');
});

