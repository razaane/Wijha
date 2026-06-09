<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Auth Module API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/auth
|
*/

Route::prefix('v1/auth')->group(function () {

    // Public routes (no authentication required)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/register/send-otp', [AuthController::class, 'sendOtp'])->name('auth.register.send-otp');
        Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    });

    // Social Authentication Routes
    Route::get('/google/redirect', [\Modules\Auth\Http\Controllers\SocialAuthController::class, 'redirectToGoogle'])->name('auth.google.redirect');
    Route::get('/google/callback', [\Modules\Auth\Http\Controllers\SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    });

    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    });

    Route::middleware('throttle:3,1')->group(function () {
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    });

    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
    });

    // Protected routes (JWT authentication required)
    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        
        // Profile Management
        Route::put('/profile', [\Modules\Auth\Http\Controllers\ProfileController::class, 'updateProfile'])->name('auth.profile.update');
        Route::post('/profile/avatar', [\Modules\Auth\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('auth.profile.avatar');
        
        Route::middleware('throttle:5,1')->group(function () {
            Route::post('/profile/phone/send-otp', [\Modules\Auth\Http\Controllers\ProfileController::class, 'sendPhoneOtp'])->name('auth.profile.phone.send-otp');
            Route::post('/profile/phone/verify', [\Modules\Auth\Http\Controllers\ProfileController::class, 'verifyPhoneOtp'])->name('auth.profile.phone.verify');
        });
    });
});
