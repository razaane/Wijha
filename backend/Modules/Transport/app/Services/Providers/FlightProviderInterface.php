<?php

namespace Modules\Transport\Services\Providers;

interface FlightProviderInterface
{
    /**
     * Get the unique identifier/name for this provider (e.g., 'amadeus').
     */
    public function getProviderName(): string;

    /**
     * Search for flights using this provider's API.
     * Must return an array of standardized flight data arrays.
     */
    public function searchFlights(string $originCode, string $destinationCode, string $date, ?string $returnDate = null, int $passengers = 1): array;
}
