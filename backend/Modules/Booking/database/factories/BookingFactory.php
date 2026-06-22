<?php

namespace Modules\Booking\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Booking\Models\Booking;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $checkIn = $this->faker->dateTimeBetween('+1 day', '+30 days');
        $checkOut = $this->faker->dateTimeBetween($checkIn, '+45 days');

        return [
            'user_id' => 1,
            'listing_id' => 1,
            'listing_ticket_id' => null,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests_count' => $this->faker->numberBetween(1, 6),
            'total_amount' => $this->faker->randomFloat(2, 50, 1000),
            'currency' => 'USD',
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled']),
        ];
    }
}
