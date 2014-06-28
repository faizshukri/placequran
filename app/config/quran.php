<?php

return array(

    //Max verses to be rendered in single image
    'max_verses' => 15,

    //Available translation (db_id => name)
    'translations' => array(
        1 => 'ar', 
        26 => 'ms',
        59 => 'en',
        68 => 'in'
    ),

    // Compression level. Higher quality mean bigger file size
    'quality' => 70,

    // Name of stylesheet. Must be inside /public/css/. No need to put .css
    // value: scheherazade, me_quran
    'style' => 'me_quran',

    // Google analytic tracking code
    'ga_code' => 'UA-12078242-6',

    // Admin email. Error log will be send to this address.
    'admin' => array(
        'email' => 'faiz@placequran.com',
        'name' => 'Faiz Shukri'
    ),

    // Full path to our tools. Install it first if still not having it.
    // PhantomJS => http://phantomjs.org
    // Mogrify => http://www.imagemagick.org
    'path' => array(
        'phantomjs' => '/usr/local/bin/phantomjs',
        'mogrify' => '/usr/local/bin/mogrify'
    )
);