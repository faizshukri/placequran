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
    
    | Table  | ID Column | Database ID | Surah ID | Verse ID | Ayah Text |
    |--------|-----------|-------------|----------|----------|-----------|
    | qurans | id        | db_id       | sura_id  | verse_id | ayah      |

    \* *Note that Malay translation have some issue with the verse ordering in some of it's surah.* 
    
6. Make storage folder writable

    ```
    chmod -R 770 app/storage/
    ```
    
Notes
-----
On first execution, the page load will be quite slow depend on internet connection since the app will download browscap for the first time.

Tasks
-----
 - Prevent batch image generation (only for new image generate, not for image that has already been generated). Limit maximum 10 images that can be generate in less than 3 seconds for a person.
 - Separate bismillah from 1st verse in every surah. Show bismillah only when appropriate; when user request more than 1 verse start with 1st verse. If only 1st verse requested, no need to show bismillah.
 - Limit to 3 translations only for a single image
 - Put surah name, and verse number in the image.
 - Analytic. (create a simple panel, or integrate to GA)
 - Panel to ease the regeneration/deletion process of images based on any condition that can be specified
    - range of time
    - certain surah/ayah/verse
    - old images that not been access for a long time
 - More parameters support. User able to
    - change font
    - change color
    - change background
 - Test, test, test
 - Refactor codes

License
-------

Placequran is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
