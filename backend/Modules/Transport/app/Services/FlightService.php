<?php

namespace Modules\Transport\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlightService
{
    /**
     * Search for flights between two cities.
     * In a real-world scenario, this would integrate with an API like Amadeus or Skyscanner.
     */
    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1)
    {
        // Mocking an external API call for demonstration. 
        // Example: Amadeus Flight Offers Search API
        /*
        $response = Http::withToken(config('transport.amadeus.api_key'))
            ->get(config('transport.amadeus.base_url') . '/v2/shopping/flight-offers', [
                'originLocationCode' => $originCode,
                'destinationLocationCode' => $destinationCode,
                'departureDate' => $date,
                'adults' => $passengers,
                'max' => 20
            ]);
        return $response->json();
        */

        // Simulating API latency
        usleep(500000); // 500ms

        return [
            [
                'id' => 'FL-'.rand(1000,9999),
                'airline' => 'Royal Air Maroc',
                'airline_code' => 'RAM',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Royal_Air_Maroc_Logo.svg/512px-Royal_Air_Maroc_Logo.svg.png',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(6, 12), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(13, 22), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'duration' => rand(1, 4) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(150, 600),
                    'currency' => 'USD'
                ],
                'stops' => rand(0, 1),
                'seats_available' => rand(2, 20)
            ],
            [
                'id' => 'FL-'.rand(1000,9999),
                'airline' => 'Air France',
                'airline_code' => 'AF',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/512px-Air_France_Logo.svg.png',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(10, 16), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(17, 23), 2, '0', STR_PAD_LEFT) . ':00:00',
                ],
                'duration' => rand(2, 6) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(200, 800),
                    'currency' => 'USD'
                ],
                'stops' => rand(0, 1),
                'seats_available' => rand(1, 15)
            ]
        ];
    }
}
