<?php

use Illuminate\Support\Facades\Route;
use Modules\Listing\Http\Controllers\ListingController;

use Modules\Listing\Http\Controllers\ListingCalendarController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1/listings')->group(function () {
    // Public routes — no authentication required
    Route::get('/browse', [ListingController::class, 'browse'])->name('listings.browse');
    Route::get('/search', [ListingController::class, 'search'])->name('listings.search');
    Route::get('/public/{id}', [ListingController::class, 'publicShow'])->name('listings.public.show');

    // Protected routes (JWT authentication required)
    Route::middleware('auth:api')->group(function () {
        // Favorites
        Route::get('/favorites', [\Modules\Listing\Http\Controllers\FavoriteController::class, 'index'])->name('favorites.index');
        Route::get('/favorites/ids', [\Modules\Listing\Http\Controllers\FavoriteController::class, 'ids'])->name('favorites.ids');
        Route::post('/{id}/favorite', [\Modules\Listing\Http\Controllers\FavoriteController::class, 'toggle'])->name('favorites.toggle');

        Route::get('/me', [ListingController::class, 'myListings'])->name('listings.me');
        Route::post('/', [ListingController::class, 'store'])->name('listings.store');
        Route::get('/{id}', [ListingController::class, 'show'])->name('listings.show');
        Route::put('/{id}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('/{id}', [ListingController::class, 'destroy'])->name('listings.destroy');
        Route::post('/{id}/photos', [ListingController::class, 'uploadPhotos'])->name('listings.photos.store');
        Route::post('/{id}/photos/reorder', [ListingController::class, 'reorderPhotos'])->name('listings.photos.reorder');
        Route::delete('/{id}/photos/{photoId}', [ListingController::class, 'destroyPhoto'])->name('listings.photos.destroy');
        
        // Calendar Routes
        Route::get('/{id}/calendar', [ListingCalendarController::class, 'index'])->name('listings.calendar.index');
        Route::put('/{id}/calendar', [ListingCalendarController::class, 'update'])->name('listings.calendar.update');
    });
});

Route::prefix('v1/host')->group(function () {
    Route::middleware('auth:api')->group(function () {
        Route::get('/insights', [\Modules\Listing\Http\Controllers\HostInsightsController::class, 'index'])->name('host.insights.index');
    });
});
