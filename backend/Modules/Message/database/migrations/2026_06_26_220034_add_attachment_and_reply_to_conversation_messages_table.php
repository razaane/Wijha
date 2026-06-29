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
        Schema::table('conversation_messages', function (Blueprint $table) {
            $table->string('attachment_url')->nullable()->after('text');
            $table->foreignId('reply_to_id')->nullable()->after('attachment_url')->constrained('conversation_messages')->nullOnDelete();
            // Make text nullable since messages can be just an image
            $table->text('text')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversation_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
            $table->dropColumn('attachment_url');
            $table->text('text')->nullable(false)->change();
        });
    }
};
