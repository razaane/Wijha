<?php

use Illuminate\Support\Facades\Route;

Route::get('/reset-password/{token}', function () {
    return view('welcome');
})->name('password.reset');

Route::get('/', function () {
    return view('welcome');
});
