<?php

use Illuminate\Support\Facades\Route;
use Modules\Listing\Http\Controllers\ListingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1/listings')->group(function () {
    Route::middleware('auth:api')->group(function () {
        Route::post('/', [ListingController::class, 'store'])->name('listings.store');
    });
});
