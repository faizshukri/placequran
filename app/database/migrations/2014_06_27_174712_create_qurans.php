<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateQurans extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		//
		Schema::create('qurans', function($table)
		{
			$table->engine = 'MyISAM';
		    $table->increments('id');
		    $table->smallInteger('db_id');
		    $table->integer('sura_id');
		    $table->integer('verse_id');
		    $table->text('ayah');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		//
		Schema::dropIfExists('qurans');
	}

}
