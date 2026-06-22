<?php

namespace Modules\Payment\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Payment\Models\Dispute;

class DisputeFactory extends Factory
{
    protected $model = Dispute::class;

    public function definition(): array
    {
        return [
            'booking_id' => 1,
            'user_id' => 1,
            'reason' => $this->faker->randomElement(['event_cancelled', 'not_as_described', 'safety_concern', 'other']),
            'evidence_text' => $this->faker->paragraph(),
            'status' => 'open',
        ];
    }
}
