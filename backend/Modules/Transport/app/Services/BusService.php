<?php

namespace Modules\Transport\Services;

class BusService
{
    /**
     * Search for buses between two cities.
     * In a real-world scenario, this would integrate with an API like Busbud or CTM.
     */
    public function searchBuses(string $origin, string $destination, string $date, int $passengers = 1)
    {
        // Mocking an external API call for demonstration.
        usleep(400000); // 400ms latency

        return [
            [
                'id' => 'BS-'.rand(100,999),
                'operator' => 'CTM',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/4/4b/CTM_Maroc_logo.svg',
                'departure' => [
                    'station' => ucfirst($origin) . ' Central Station',
                    'time' => $date . 'T' . str_pad(rand(6, 10), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'arrival' => [
                    'station' => ucfirst($destination) . ' Main Terminal',
                    'time' => $date . 'T' . str_pad(rand(12, 16), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'duration' => rand(3, 8) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(15, 45),
                    'currency' => 'MAD'
                ],
                'amenities' => ['WiFi', 'Air Conditioning', 'Power Outlets'],
                'seats_available' => rand(5, 30)
            ],
            [
                'id' => 'BS-'.rand(100,999),
                'operator' => 'Supratours',
                'logo' => 'https://www.oncf.ma/themes/custom/oncf/logo.svg', // Proxy for Supratours
                'departure' => [
                    'station' => ucfirst($origin) . ' ONCF Station',
                    'time' => $date . 'T' . str_pad(rand(14, 18), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'station' => ucfirst($destination) . ' Supratours Terminal',
                    'time' => $date . 'T' . str_pad(rand(19, 23), 2, '0', STR_PAD_LEFT) . ':30:00',
                ],
                'duration' => rand(3, 8) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(12, 40),
                    'currency' => 'MAD'
                ],
                'amenities' => ['Air Conditioning'],
                'seats_available' => rand(2, 25)
            ]
        ];
    }
}
