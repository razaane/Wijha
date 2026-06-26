<?php

use Illuminate\Support\Facades\Route;
use Modules\Transport\Http\Controllers\TransportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v1/transport')->group(function () {
    Route::post('/flights/search', [TransportController::class, 'searchFlights'])->name('transport.flights.search');
    Route::post('/buses/search', [TransportController::class, 'searchBuses'])->name('transport.buses.search');
});
