Placequran.com
==============

Installation
------------

1. Prepare tools
    - __Composer__: https://getcomposer.org
    - __PhantomJS__: http://phantomjs.org
    - __Mogrify__: http://www.imagemagick.org

2. Install dependencies
    
    ```
    composer install
    ```

3. Update settings
    - __Database__
        1. Production: `app/config/database.php`
        2. Development / Local: `app/config/local/database.php`
    - __Quran__ - `app/config/quran.php`
    - __Mail__ - `app/config/mail.php` (if enabled and configured, all errors will be sent to admin's email; as set in `Quran` setting)

4. Migrate database structure
    
    ```
    php artisan migrate
    ```

5. Download quran database from http://qurandatabase.org/. Set the value as below and import to your database server.
    
    | Table             | ID Column | Database ID | Surah ID | Verse ID | Ayah Text |
    |-------------------|-----------|-------------|----------|----------|-----------|
    | `your table name` | id        | db_id       | sura_id  | verse_id | ayah      |

    \* *Note that Malay translation have some issue with the verse ordering in some of it's surah.* 
    
6. Make storage folder rewritable

    ```
    chmod -R 770 app/storage/
    ```
    
Notes
-----
On first execution, the page load will be quite slow depend on internet connection since the app will download browscap for the first time.

License
-------

Placequran is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
