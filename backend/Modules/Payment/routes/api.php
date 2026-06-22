<?php

use Illuminate\Support\Facades\Route;
use Modules\Payment\Http\Controllers\DisputeController;
use Modules\Payment\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| Payment Module API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/payment
|
*/

Route::prefix('v1/payment')->group(function () {
    Route::middleware('auth:api')->group(function () {
        // Payment listing & details
        Route::get('/me', [PaymentController::class, 'index'])->name('payment.index');
        Route::get('/earnings', [PaymentController::class, 'earnings'])->name('payment.earnings');
        Route::get('/{id}', [PaymentController::class, 'show'])->name('payment.show');

        // Payment processing (TODO: Stripe integration)
        Route::post('/bookings/{bookingId}/pay', [PaymentController::class, 'store'])->name('payment.store');

        // Disputes
        Route::post('/bookings/{bookingId}/dispute', [DisputeController::class, 'store'])->name('payment.dispute.store');
    });
});
