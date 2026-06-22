<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Listing\Models\Listing;
use Modules\Listing\Models\ListingTicket;
use Modules\Listing\Models\ListingAvailability;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Core Locations (if they don't exist)
        // Usually these would be seeded from a real dataset, but we'll mock a few for the demo
        
        // 2. Create Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@wijha.com'],
            [
                'name' => 'Wijha Admin',
                'password' => 'password', // Auto-hashed by model cast
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );

        $host = User::firstOrCreate(
            ['email' => 'host@wijha.com'],
            [
                'name' => 'Demo Host',
                'password' => 'password',
                'role' => User::ROLE_PARTNER,
                'email_verified_at' => now(),
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'user@wijha.com'],
            [
                'name' => 'Demo User',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'email_verified_at' => now(),
            ]
        );

        // 3. Create Demo Listings for the Host
        if (Listing::count() === 0) {
            // Rental 1
            $rental1 = Listing::create([
                'user_id' => $host->id,
                'type' => 'rental',
                'title' => 'Luxury Riad in Marrakech Medina',
                'description' => 'Experience authentic Moroccan hospitality in this beautifully restored 18th-century Riad featuring a central courtyard with plunge pool and panoramic rooftop terrace.',
                'price' => 150.00,
                'currency' => 'USD',
                'address_street' => 'Derb Dabachi',
                'address_city' => 'Marrakech',
                'address_state' => 'Marrakech-Safi',
                'address_country' => 'MA',
                'latitude' => 31.6295,
                'longitude' => -7.9811,
                'guests_count' => 4,
                'bedrooms_count' => 2,
                'bathrooms_count' => 2,
                'amenities' => ['wifi', 'pool', 'ac', 'breakfast', 'patio'],
                'is_active' => true,
                'is_draft' => false,
            ]);

            // Rental 2
            $rental2 = Listing::create([
                'user_id' => $host->id,
                'type' => 'rental',
                'title' => 'Modern Apartment in Casablanca Twin Center',
                'description' => 'High-floor apartment with stunning ocean and city views. Walking distance to major businesses and luxury shopping.',
                'price' => 90.00,
                'currency' => 'USD',
                'address_street' => 'Boulevard Al Massira',
                'address_city' => 'Casablanca',
                'address_state' => 'Casablanca-Settat',
                'address_country' => 'MA',
                'latitude' => 33.5898,
                'longitude' => -7.6038,
                'guests_count' => 2,
                'bedrooms_count' => 1,
                'bathrooms_count' => 1,
                'amenities' => ['wifi', 'tv', 'ac', 'kitchen', 'elevator'],
                'is_active' => true,
                'is_draft' => false,
            ]);

            // Event 1
            $event1 = Listing::create([
                'user_id' => $host->id,
                'type' => 'event',
                'title' => 'Sahara Desert Music Festival',
                'description' => 'A 3-day electronic and traditional music festival in the heart of the Merzouga dunes under the stars.',
                'price' => 200.00, // Base price
                'currency' => 'USD',
                'address_street' => 'Erg Chebbi',
                'address_city' => 'Merzouga',
                'address_state' => 'Draa-Tafilalet',
                'address_country' => 'MA',
                'latitude' => 31.0963,
                'longitude' => -4.0123,
                'amenities' => ['parking', 'food', 'camping', 'music'],
                'is_active' => true,
                'is_draft' => false,
            ]);

            $event1->eventMeta()->create([
                'start_date' => Carbon::now()->addMonths(2)->format('Y-m-d H:i:s'),
                'end_date' => Carbon::now()->addMonths(2)->addDays(3)->format('Y-m-d H:i:s'),
                'is_multi_day' => true,
                'event_category' => 'Festival',
                'minimum_age' => 18,
                'expected_attendance' => 1000,
            ]);

            ListingTicket::create([
                'listing_id' => $event1->id,
                'name' => 'General Admission',
                'description' => 'Access to all 3 days',
                'price' => 200.00,
                'quantity_available' => 500,
                'currency' => 'USD',
            ]);

            ListingTicket::create([
                'listing_id' => $event1->id,
                'name' => 'VIP Glamping',
                'description' => 'VIP access + luxury tent accommodation',
                'price' => 850.00,
                'quantity_available' => 50,
                'currency' => 'USD',
            ]);
            
            $this->command->info('Demo data seeded successfully!');
        } else {
            $this->command->info('Database already has listings. Skipping demo data.');
        }
    }
}
