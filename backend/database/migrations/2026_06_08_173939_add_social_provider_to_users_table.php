<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider_name')->nullable();
            $table->string('provider_id')->nullable();
            $table->string('password')->nullable()->change(); // Password can be null for social logins
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['provider_name', 'provider_id']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
