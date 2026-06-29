<?php

namespace Modules\Transport\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FlightService
{
    /**
     * Get the Amadeus OAuth2 Access Token
     */
    protected function getAccessToken()
    {
        return Cache::remember('amadeus_access_token', 1700, function () { // Token lasts for ~30 mins
            $clientId = config('transport.amadeus.client_id', env('AMADEUS_CLIENT_ID'));
            $clientSecret = config('transport.amadeus.client_secret', env('AMADEUS_CLIENT_SECRET'));
            $baseUrl = config('transport.amadeus.base_url', env('AMADEUS_BASE_URL', 'https://test.api.amadeus.com'));

            if (!$clientId || !$clientSecret) {
                Log::warning('Amadeus API keys missing. Falling back to mock data.');
                return null;
            }

            $response = Http::asForm()->post($baseUrl . '/v1/security/oauth2/token', [
                'grant_type' => 'client_credentials',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

            if ($response->successful()) {
                return $response->json('access_token');
            }

            Log::error('Failed to get Amadeus access token', ['response' => $response->body()]);
            return null;
        });
    }

    /**
     * Search for flights between two cities using Amadeus API.
     */
    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1)
    {
        $token = $this->getAccessToken();

        // Fallback to mock data if no token (for dev/testing without keys)
        if (!$token) {
            return $this->getMockData($originCode, $destinationCode, $date);
        }

        $baseUrl = config('transport.amadeus.base_url', env('AMADEUS_BASE_URL', 'https://test.api.amadeus.com'));

        $params = [
            'originLocationCode' => $originCode,
            'destinationLocationCode' => $destinationCode,
            'departureDate' => $date,
            'adults' => $passengers,
            'max' => 20
        ];

        if ($returnDate) {
            $params['returnDate'] = $returnDate;
        }

        $response = Http::withToken($token)
            ->get($baseUrl . '/v2/shopping/flight-offers', $params);

        if ($response->successful()) {
            return $this->formatAmadeusResponse($response->json());
        }

        Log::error('Amadeus flight search failed', ['response' => $response->body()]);
        return [];
    }

    /**
     * Map Amadeus API response to our standard Frontend schema
     */
    protected function formatAmadeusResponse(array $data)
    {
        $formatted = [];
        $offers = $data['data'] ?? [];
        $dictionaries = $data['dictionaries'] ?? [];

        foreach ($offers as $offer) {
            if (empty($offer['itineraries'])) continue;
            
            $itinerary = $offer['itineraries'][0]; // Outbound
            $segments = $itinerary['segments'];
            $firstSegment = $segments[0];
            $lastSegment = end($segments);
            
            $airlineCode = $firstSegment['carrierCode'];
            $airlineName = $dictionaries['carriers'][$airlineCode] ?? $airlineCode;

            $formatted[] = [
                'id' => 'FL-' . $offer['id'],
                'airline' => $airlineName,
                'airline_code' => $airlineCode,
                'logo' => "https://ui-avatars.com/api/?name={$airlineCode}&background=0ea5e9&color=fff&rounded=true&bold=true&size=128",
                'departure' => [
                    'iataCode' => $firstSegment['departure']['iataCode'],
                    'time' => $firstSegment['departure']['at'],
                ],
                'arrival' => [
                    'iataCode' => $lastSegment['arrival']['iataCode'],
                    'time' => $lastSegment['arrival']['at'],
                ],
                'duration' => $this->parseIsoDuration($itinerary['duration']),
                'price' => [
                    'amount' => (float) $offer['price']['total'],
                    'currency' => $offer['price']['currency']
                ],
                'stops' => count($segments) - 1,
                'seats_available' => $offer['numberOfBookableSeats'] ?? 0
            ];
        }

        return $formatted;
    }

    /**
     * Parse ISO 8601 duration string (e.g. PT2H30M) to human readable (e.g. 2h 30m)
     */
    protected function parseIsoDuration($isoDuration)
    {
        $interval = new \DateInterval($isoDuration);
        $hours = $interval->h + ($interval->d * 24);
        return $hours . 'h ' . $interval->i . 'm';
    }

    /**
     * Mock data fallback for missing API keys
     */
    protected function getMockData(string $originCode, string $destinationCode, string $date)
    {
        $airlines = [
            ['name' => 'Royal Air Maroc', 'code' => 'RAM', 'bg' => 'ef4444'],
            ['name' => 'Air France', 'code' => 'AF', 'bg' => '1d4ed8'],
            ['name' => 'Emirates', 'code' => 'EK', 'bg' => 'b91c1c'],
            ['name' => 'Qatar Airways', 'code' => 'QR', 'bg' => '831843'],
            ['name' => 'Turkish Airlines', 'code' => 'TK', 'bg' => 'ea580c'],
        ];

        $results = [];
        $numResults = rand(1, 3); // Return 1 to 3 mock flights

        for ($i = 0; $i < $numResults; $i++) {
            $airline = $airlines[array_rand($airlines)];
            $results[] = [
                'id' => 'FL-'.rand(10000,99999),
                'airline' => $airline['name'],
                'airline_code' => $airline['code'],
                'logo' => 'https://ui-avatars.com/api/?name='.$airline['code'].'&background='.$airline['bg'].'&color=fff&rounded=true&bold=true&size=128',
                'departure' => [
                    'iataCode' => strtoupper($originCode),
                    'time' => $date . 'T' . str_pad(rand(6, 20), 2, '0', STR_PAD_LEFT) . ':' . str_pad(rand(0, 5) * 10, 2, '0', STR_PAD_LEFT) . ':00',
                ],
                'arrival' => [
                    'iataCode' => strtoupper($destinationCode),
                    'time' => $date . 'T' . str_pad(rand(13, 23), 2, '0', STR_PAD_LEFT) . ':' . str_pad(rand(0, 5) * 10, 2, '0', STR_PAD_LEFT) . ':00',
                ],
                'duration' => rand(2, 8) . 'h ' . rand(0, 59) . 'm',
                'price' => [
                    'amount' => rand(150, 850) * 10, // Prices between 1500 and 8500
                    'currency' => 'MAD'
                ],
                'stops' => rand(0, 2),
                'seats_available' => rand(1, 25)
            ];
        }

        return $results;
    }
}
