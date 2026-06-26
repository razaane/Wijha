<?php

namespace Modules\Transport\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Transport\Services\FlightService;
use Modules\Transport\Services\BusService;

class TransportController extends Controller
{
    protected $flightService;
    protected $busService;

    public function __construct(FlightService $flightService, BusService $busService)
    {
        $this->flightService = $flightService;
        $this->busService = $busService;
    }

    /**
     * Search for flights via external API integration.
     */
    public function searchFlights(Request $request)
    {
        $request->validate([
            'origin' => 'required|string|size:3', // IATA Code
            'destination' => 'required|string|size:3', // IATA Code
            'date' => 'required|date|after_or_equal:today',
            'passengers' => 'nullable|integer|min:1|max:9',
        ]);

        try {
            $flights = $this->flightService->searchFlights(
                $request->origin,
                $request->destination,
                $request->date,
                null,
                $request->passengers ?? 1
            );

            return response()->json([
                'status' => 'success',
                'data' => $flights,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve flights: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for buses via external API integration.
     */
    public function searchBuses(Request $request)
    {
        $request->validate([
            'origin' => 'required|string|max:100',
            'destination' => 'required|string|max:100',
            'date' => 'required|date|after_or_equal:today',
            'passengers' => 'nullable|integer|min:1|max:9',
        ]);

        try {
            $buses = $this->busService->searchBuses(
                $request->origin,
                $request->destination,
                $request->date,
                $request->passengers ?? 1
            );

            return response()->json([
                'status' => 'success',
                'data' => $buses,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve buses: ' . $e->getMessage()
            ], 500);
        }
    }
}
