<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateImages extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		//
		Schema::create('images', function($table)
		{
		    $table->increments('id');
		    $table->integer('surah');
		    $table->string('verses', 100);
		    $table->string('translation', 30);
		    $table->string('file_name', 50);
		    $table->integer('file_size');
		    $table->integer('access_count');
		    $table->timestamps();
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
		Schema::dropIfExists('images');
	}

}
