<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\KycController;

Route::prefix('v1/admin')->middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/stats', [\Modules\Admin\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/kyc', [KycController::class, 'index']);
    Route::post('/kyc/{id}/approve', [KycController::class, 'approve']);
    Route::post('/kyc/{id}/reject', [KycController::class, 'reject']);
});
