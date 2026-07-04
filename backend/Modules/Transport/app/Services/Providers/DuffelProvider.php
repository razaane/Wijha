<?php

namespace Modules\Transport\Services\Providers;

class DuffelProvider implements FlightProviderInterface
{
    public function getProviderName(): string
    {
        return 'duffel';
    }

    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1): array
    {
        return [
            [
                'id' => uniqid('DUF-FL-'),
                'provider' => 'Duffel',
                'airline' => 'Emirates',
                'airline_code' => 'EK',
                'logo' => 'https://ui-avatars.com/api/?name=EK&background=d71920&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(5, 9), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(16, 20), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'duration' => rand(6, 12) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(4500, 8000) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => rand(1, 2),
                'seats_available' => rand(1, 4)
            ],
            [
                'id' => uniqid('DUF-FL-'),
                'provider' => 'Duffel',
                'airline' => 'Qatar Airways',
                'airline_code' => 'QR',
                'logo' => 'https://ui-avatars.com/api/?name=QR&background=5c0632&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(10, 14), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(20, 23), 2, '0', STR_PAD_LEFT) . ':45:00',
                ],
                'duration' => rand(7, 14) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(5000, 9000) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => 1,
                'seats_available' => rand(10, 30)
            ]
        ];
    }
}
