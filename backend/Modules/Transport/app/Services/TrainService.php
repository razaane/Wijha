<?php

namespace Modules\Transport\Services;

class TrainService
{
    /**
     * Search for trains between two cities.
     * In a real-world scenario, this would integrate with ONCF.
     */
    public function searchTrains(string $origin, string $destination, string $date, int $passengers = 1)
    {
        // Mocking an external API call for demonstration.
        usleep(400000); // 400ms latency

        return [
            [
                'id' => 'TR-'.rand(100,999),
                'operator' => 'Al Boraq',
                'logo' => 'https://ui-avatars.com/api/?name=Al+Boraq&background=f59e0b&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'station' => ucfirst($origin) . ' Ville',
                    'time' => $date . 'T' . str_pad(rand(6, 10), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'station' => ucfirst($destination) . ' Ville',
                    'time' => $date . 'T' . str_pad(rand(11, 14), 2, '0', STR_PAD_LEFT) . ':15:00',
                ],
                'duration' => rand(1, 3) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => 250,
                    'currency' => 'MAD'
                ],
                'amenities' => ['WiFi', 'Air Conditioning', 'Cafe', 'Power Outlets'],
                'seats_available' => rand(10, 50)
            ],
            [
                'id' => 'TR-'.rand(100,999),
                'operator' => 'ONCF TGV',
                'logo' => 'https://ui-avatars.com/api/?name=ONCF&background=ea580c&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'station' => ucfirst($origin) . ' Voyageurs',
                    'time' => $date . 'T' . str_pad(rand(15, 18), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'arrival' => [
                    'station' => ucfirst($destination) . ' Oasis',
                    'time' => $date . 'T' . str_pad(rand(19, 22), 2, '0', STR_PAD_LEFT) . ':45:00',
                ],
                'duration' => rand(2, 5) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => 180,
                    'currency' => 'MAD'
                ],
                'amenities' => ['Air Conditioning', 'Power Outlets'],
                'seats_available' => rand(5, 40)
            ]
        ];
    }
}
