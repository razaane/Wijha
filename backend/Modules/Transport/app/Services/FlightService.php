<?php

namespace Modules\Transport\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Modules\Transport\Services\Providers\FlightProviderInterface;
use Modules\Transport\Services\Providers\AmadeusProvider;
use Modules\Transport\Services\Providers\SkyscannerProvider;
use Modules\Transport\Services\Providers\DuffelProvider;

class FlightService
{
    protected array $providers;

    public function __construct()
    {
        // Register available providers
        $this->providers = [
            'amadeus' => new AmadeusProvider(),
            'skyscanner' => new SkyscannerProvider(),
            'duffel' => new DuffelProvider(),
        ];
    }

    /**
     * Search for flights across multiple providers.
     */
    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1, string $providerName = 'all'): array
    {
        $allFlights = [];

        foreach ($this->providers as $key => $provider) {
            // Filter by provider if a specific one is requested
            if ($providerName !== 'all' && $key !== $providerName) {
                continue;
            }

            try {
                $providerFlights = $provider->searchFlights($originCode, $destinationCode, $date, $returnDate, $passengers);
                $allFlights = array_merge($allFlights, $providerFlights);
            } catch (\Exception $e) {
                Log::error("Flight API Provider Error ({$key}): " . $e->getMessage());
            }
        }

        // Sort by price ascending
        usort($allFlights, function ($a, $b) {
            return $a['price']['amount'] <=> $b['price']['amount'];
        });

        // Cache the flight results by ID for 30 minutes to enable checkout
        foreach ($allFlights as $flight) {
            Cache::put('flight_' . $flight['id'], $flight, now()->addMinutes(30));
        }

        return $allFlights;
    }

    /**
     * Retrieve flight details from cache for checkout.
     */
    public function getFlightDetails(string $flightId): ?array
    {
        return Cache::get('flight_' . $flightId);
    }
}
