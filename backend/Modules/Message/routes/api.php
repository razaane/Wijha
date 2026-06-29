<?php

use Illuminate\Support\Facades\Route;
use Modules\Message\Http\Controllers\MessageController;

Route::middleware(['auth:api'])->prefix('v1/message')->group(function () {
    Route::post('send', [MessageController::class, 'send']);
    Route::get('unread-count', [MessageController::class, 'unreadCount']);
    Route::get('conversations', [MessageController::class, 'conversations']);
    Route::get('conversations/{id}', [MessageController::class, 'messages']);
    Route::post('{id}/react', [MessageController::class, 'react']);
});
