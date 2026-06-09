<?php

use Illuminate\Support\Facades\Route;
use Modules\Listing\Http\Controllers\ListingController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('listings', ListingController::class)->names('listing');
});
