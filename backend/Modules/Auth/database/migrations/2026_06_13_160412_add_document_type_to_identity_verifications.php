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
        Schema::table('identity_verifications', function (Blueprint $table) {
            $table->enum('document_type', ['id_card', 'passport'])->default('id_card')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('identity_verifications', function (Blueprint $table) {
            $table->dropColumn('document_type');
        });
    }
};
