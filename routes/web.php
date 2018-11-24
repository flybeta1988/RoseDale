<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    $app = app();
    return view('welcome')->with('version', $app::VERSION);
});

Route::get('/foo', function () {
    $app = app();
    return view('foo')->with('version', $app::VERSION);
});
