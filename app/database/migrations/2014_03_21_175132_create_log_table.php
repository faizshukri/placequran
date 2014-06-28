<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLogTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		//
		Schema::create('logs', function($table)
		{
		    $table->increments('id');
		    $table->integer('surah');
		    $table->string('verses', 100);
		    $table->string('translation', 30);
		    $table->string('referer', 255)->nullable();
		    $table->string('ip_address', 50);
		    $table->string('country_code', 20);
		    $table->string('browser', 25);
		    $table->string('browser_version', 10);
		    $table->string('platform', 25);
		    $table->integer('type');
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
		Schema::dropIfExists('logs');
	}

}
