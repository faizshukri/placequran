<?php
use Symfony\Component\Process\Process;

class QuranController extends BaseController {

    // Quran model instance
    private $quran;

    // Maximum number of verse to render on a single image
    private $max_verses;

    // Surah
    private $surah;

    // Verses
    private $verses;

    // Translation
    private $translation;

    // Array of translation's database id
    private $translation_ids;

    // Translation that available
    private $available_translation;

    // Just a simple restriction
    private $secretKey;

    // Url requested
    private $url;

    public function __construct(Quran $quran) {
        $this->quran = $quran;
        $this->available_translation = array_values( Config::get('quran.translations') );
        $this->translation_ids = array_flip( Config::get('quran.translations') );
        $this->secretKey = Config::get('app.key');
        $this->max_verses = Config::get('quran.max_verses');
    }

    public function index($surah, $verses, $translation = 'ar'){
        $this->surah = $surah;
        $this->verses = $verses;
        $this->translation = $translation;
        $param = Input::all();

        // HTML View
        if(isset($param['type']) &&  $param['type'] == 'debug' && $this->authorized( isset($param['key']) ? $param['key'] : '0' ) ){

            $data = array();

            foreach (explode(',',$this->translation) as $key => $value) {
                $tmp = $this->quran->getVersion( $this->translation_ids[$value] );
                $data[$value] = $tmp->where('sura_id', '=', $this->surah)->whereIn('verse_id', explode(',',$this->verses))->get();
                $trueAyah = array();
                foreach ($data[$value] as $an_ayah) {
                    $trueAyah[$an_ayah->verse_id] = $an_ayah->ayah;
                }
                $data[$value] = $trueAyah;
            }

            return $this->displayHTML($data);

        // Image View
        } else {

            if( !$this->filterParam() ) return $this->noImageFound();
            $image_path = storage_path() . '/quran/'.$this->getFileName();

            // If file already exist, just serve it
            if( file_exists( $image_path ) ){
                $this->logUserAccess(2);
                $img = Image::make($image_path);
                return $img->response();
            }

            $this->url = $this->surah.'/'.$this->verses.'/'.$this->translation;
            $key = md5($this->url . $this->secretKey);

            // Generate the image with Phantomjs and compress it with Imagemagick
            $command = Config::get('quran.path')['phantomjs'].' '.base_path().'/rasterize.js "'. url() .'/'. $this->url .'?type=debug&key='. $key .'" '.$image_path.' 600px';
            $command .= ' && '.Config::get('quran.path')['mogrify'].' -quality '.Config::get('quran.quality').' ' . $image_path;

            $process = new Process($command);
            $process->setTimeout(60); //seconds
            $process->run();

            // executes after the command finishes
            if (!$process->isSuccessful()) {

                // @TODO should return fail image
                return $this->noImageFound();
            }

            if(file_exists($image_path)){
                $this->logUserAccess(1);
                $img = Image::make($image_path);
                return $img->response();
            }

        }
    }

    private function filterParam(){

        // Extract provided verses to individual format
        $this->verses = $this->extractVerses(explode(',', $this->verses));

        // Limit to max_verses variable
        $this->sliceVerses();
        
        // Check verse existing
        if( !$this->checkVerseExist() ) return false;

        // Filter out non available translation
        $this->filterTranslation();

        return true;
    }

    private function sliceVerses(){
        $verses_array = explode(',',$this->verses);
        if(sizeof($verses_array) > $this->max_verses){
            $this->verses = implode(',', array_slice($verses_array, 0, $this->max_verses) );
        }
    }

    private function extractVerses($verse){
        $verses = array();
        while(!empty($verse)){
            $value = array_shift($verse);

            if(strpos($value, '-') !== false){
                $range = explode('-', $value);
                $verses = array_merge($verses, range($range[0], $range[1]));
            } else {
                $verses[] = (int) $value;
            }
        }
        return implode(',',$verses);
    }

    private function checkVerseExist(){
        if(!$this->quran->getVersion($this->translation_ids['ar'])
            ->where('sura_id', '=', $this->surah)
            ->whereIn('verse_id', explode(',', $this->verses))->count()
            )
            return false;
        return true;
    }

    private function filterTranslation(){
        $this->translation = implode(',',array_unique( array_intersect( explode( ',', $this->translation), $this->available_translation) ) );
        if(!$this->translation) $this->translation = 'ar';
    }

    // Return file name. If $raw is true, it will return the original file name instead of hash version
    private function getFileName($raw = false){
        $raw_string = $this->surah . '|' . $this->verses . '|' . $this->translation;
        return $raw ? $raw_string : md5($raw_string).'.png';
    }

    private function authorized($key){
        return $key == md5($this->surah . '/' . $this->verses . '/' . $this->translation . $this->secretKey);
    }

    public function noImageFound(){
        $img = Image::make(public_path('img/notfound.jpg'));
        return $img->response();
    }

    private function displayHTML($data){
        $groups = array();
        $active_group = 0;

        $output = array();
        $output_counter = 0;

        $nums = array_keys( array_values($data)[0] );

        foreach( $nums as $k => $num ) {

            // if this isn't the first item, and the current number
            // isn't one more than the previous one, increment the counter
            if( $k !== 0 && $nums[$k] !== $nums[$k-1]+1 )
                $active_group++;

            // add this number to a group
            $groups[ $active_group ][] = $num;

        }

        // take the 1st and last of each group
        foreach( $groups as $group ) {
            $array_groups = array_values($group);
            $first = array_shift( $array_groups );
            $output[$output_counter][] = $first;

            $array_groups = array_values($group);
            $last = array_pop( $array_groups );
            if( $first !== $last )
                $output[$output_counter][] = $last;

            $output_counter++;
        }

        $numeral = array(0 => '.', 1 => '١', 2 => '٢', 3 => '٣', 4 => '٤', 5 => '٥', 6 => '٦', 7 => '٧', 8 => '٨', 9 => '٩'); 

        // Translate roman number to arabic format
        $get_numeric = function($val) use($numeral){
            $nums = str_split($val);
            foreach ($nums as $key => $value) {
                $nums[$key] = $numeral[$value];
            }
            return implode('',$nums);
        };

        return View::make('qurans.index', 
                        array(
                            'range_ayah' => $output, 
                            'ayah' => $data, 
                            'get_numeric' => $get_numeric
                        ));
    }

    /**
     * My own simple tracking system. Just track image access, and user access. - Faiz
     * @type int 1 for new image, 2 for existing
     * @TODO Change to Google Analytic for userAccess log
     */
    private function logUserAccess($type = 1){
        $bc = new phpbrowscap\Browscap(storage_path() . '/cache');
        $browser = $bc->getBrowser();

        $log = new LogAccess;
        $log->surah = $this->surah;
        $log->verses = $this->verses;
        $log->translation = $this->translation;
        $log->referer = (isset($_SERVER['HTTP_REFERER'])) ? $_SERVER['HTTP_REFERER'] : null;
        $log->ip_address = (isset($_SERVER["HTTP_CF_CONNECTING_IP"])) ? $_SERVER["HTTP_CF_CONNECTING_IP"] : $_SERVER['REMOTE_ADDR'];
        $log->country_code = (isset($_SERVER["HTTP_CF_IPCOUNTRY"])) ? $_SERVER["HTTP_CF_IPCOUNTRY"] : 0;
        $log->browser = $browser->Browser;
        $log->browser_version = $browser->Version;
        $log->platform = $browser->Platform;
        $log->type = $type;
        $log->save();

        $this->logImageAccess();
    }

    private function logImageAccess(){
        $img = ImageAccess::where('file_name', '=', $this->getFileName())->first();
        if(!$img){
            $file_path = storage_path() . '/quran/'.$this->getFileName();
            $img = new ImageAccess;
            $img->surah = $this->surah;
            $img->verses = $this->verses;
            $img->translation = $this->translation;
            $img->file_name = $this->getFileName();
            $img->file_size = (file_exists($file_path)) ? filesize($file_path) : 0;
            $img->access_count = 1;
        } else {
            $img->access_count += 1;
        }
        $img->save();
    }

    // Debug function
    private function debugParam($var = false){
        echo '<pre>';
        var_dump($this->surah);
        var_dump($this->verses);
        var_dump($this->translation);
        var_dump($this->getFileName(true));
        if($var) var_dump($var);
        echo '</pre>';
        die();
    }

}
