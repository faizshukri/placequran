<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', 'HomeController@index');

Route::get('{surah}/{verse}', 'QuranController@index')
    ->where(array( 'surah' => '[0-9]+', 'verse' => '[0-9\,\-]+' ));

Route::get('{surah}/{verse}/{translation}', 'QuranController@index')
    ->where(array( 'surah' => '[0-9]+', 'verse' => '[0-9\,\-]+', 'translation' => '[a-zA-Z\,]+' ));