<?php

namespace Modules\Payment\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Payment\Models\Payment;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'booking_id' => 1,
            'host_id' => 1,
            'amount' => $this->faker->randomFloat(2, 50, 2000),
            'currency' => 'USD',
            'stripe_charge_id' => null,
            'status' => $this->faker->randomElement(['pending', 'succeeded', 'failed']),
        ];
    }
}
