<?php

class Quran extends Eloquent {
	protected $guarded = array();

	public static $rules = array();

	protected $table = 'qurans';

	public function getVersion($id){
		return $this->where('db_id', '=', $id);
	}
}
