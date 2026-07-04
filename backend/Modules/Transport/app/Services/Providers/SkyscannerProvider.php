<?php

namespace Modules\Transport\Services\Providers;

class SkyscannerProvider implements FlightProviderInterface
{
    public function getProviderName(): string
    {
        return 'skyscanner';
    }

    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1): array
    {
        return [
            [
                'id' => uniqid('SKY-FL-'),
                'provider' => 'Skyscanner',
                'airline' => 'Royal Air Maroc',
                'airline_code' => 'RAM',
                'logo' => 'https://ui-avatars.com/api/?name=RAM&background=ef4444&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(7, 11), 2, '0', STR_PAD_LEFT) . ':15:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(12, 16), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'duration' => rand(1, 4) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(1500, 2500) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => rand(0, 1),
                'seats_available' => rand(5, 20)
            ],
            [
                'id' => uniqid('SKY-FL-'),
                'provider' => 'Skyscanner',
                'airline' => 'Ryanair',
                'airline_code' => 'RYR',
                'logo' => 'https://ui-avatars.com/api/?name=RYR&background=073590&color=f4c900&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(18, 22), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(23, 23), 2, '0', STR_PAD_LEFT) . ':55:00',
                ],
                'duration' => rand(2, 4) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(800, 1500) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => 0,
                'seats_available' => rand(1, 6)
            ]
        ];
    }
}
