<?php

use Illuminate\Support\Facades\Route;
use Modules\Payment\Http\Controllers\DisputeController;

Route::prefix('v1/payment')->group(function () {
    Route::middleware('auth:api')->group(function () {
        Route::post('/bookings/{bookingId}/dispute', [DisputeController::class, 'store'])->name('payment.dispute.store');
    });
});
