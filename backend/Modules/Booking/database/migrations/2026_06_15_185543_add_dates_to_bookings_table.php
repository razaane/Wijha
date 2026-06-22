<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add check-in/check-out dates and guest count to bookings table.
     * Required for rental-type bookings to support date-based availability checks.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->date('check_in')->nullable()->after('listing_ticket_id');
            $table->date('check_out')->nullable()->after('check_in');
            $table->unsignedInteger('guests_count')->nullable()->after('check_out');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['check_in', 'check_out', 'guests_count']);
        });
    }
};
