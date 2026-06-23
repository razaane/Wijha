<?php

namespace Modules\Admin\Database\Seeders;

use Illuminate\Database\Seeder;

class AdminDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@wijha.com'],
            [
                'name' => 'Wijha Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => \App\Models\User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );
    }
}
