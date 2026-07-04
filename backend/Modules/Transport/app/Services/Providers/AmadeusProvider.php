<?php

namespace Modules\Transport\Services\Providers;

class AmadeusProvider implements FlightProviderInterface
{
    public function getProviderName(): string
    {
        return 'amadeus';
    }

    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1): array
    {
        // Mock Amadeus API Response
        return [
            [
                'id' => uniqid('AMD-FL-'),
                'provider' => 'Amadeus',
                'airline' => 'Air France',
                'airline_code' => 'AF',
                'logo' => 'https://ui-avatars.com/api/?name=AF&background=00205b&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(6, 10), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(12, 16), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'duration' => rand(2, 5) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(2200, 3500) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => rand(0, 1),
                'seats_available' => rand(1, 9)
            ],
            [
                'id' => uniqid('AMD-FL-'),
                'provider' => 'Amadeus',
                'airline' => 'Lufthansa',
                'airline_code' => 'LH',
                'logo' => 'https://ui-avatars.com/api/?name=LH&background=0a1128&color=f9a826&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(14, 18), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(19, 23), 2, '0', STR_PAD_LEFT) . ':45:00',
                ],
                'duration' => rand(3, 7) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(2800, 4200) * $passengers,
                    'currency' => 'MAD'
                ],
                'stops' => 1,
                'seats_available' => rand(2, 5)
            ]
        ];
    }
}
