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
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Basics
            $table->string('type'); // rental, tour, event
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);

            // Rental Specific Basics
            $table->string('property_type')->nullable(); // House, Apartment, Barn, etc.
            $table->string('privacy_type')->nullable(); // entire_place, private_room, shared_room
            
            // Granular Address
            $table->string('address_country')->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_apt')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_province')->nullable();
            $table->string('address_postal_code')->nullable();
            
            // Map
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Floor Plan
            $table->integer('guests_count')->default(1);
            $table->integer('bedrooms_count')->default(1);
            $table->integer('beds_count')->default(1);
            $table->integer('bathrooms_count')->default(1);
            $table->boolean('has_locks')->default(false);

            // JSON Arrays
            $table->json('amenities')->nullable();
            $table->json('safety_items')->nullable();
            $table->json('photos')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
