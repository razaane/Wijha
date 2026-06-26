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
    protected $trainService;

    public function __construct(FlightService $flightService, BusService $busService, \Modules\Transport\Services\TrainService $trainService)
    {
        $this->flightService = $flightService;
        $this->busService = $busService;
        $this->trainService = $trainService;
    }

    /**
     * Search for flights via external API integration.
     */
    public function searchFlights(Request $request)
    {
        $validCities = 'casablanca,rabat,marrakech,tangier,agadir,fes,tunis,algiers,cairo,dubai,doha,riyadh,jeddah,amman,beirut,muscat,kuwait,manama';

        $request->merge([
            'origin' => strtolower($request->origin ?? ''),
            'destination' => strtolower($request->destination ?? ''),
        ]);

        $request->validate([
            'origin' => 'required|string|in:' . $validCities,
            'destination' => 'required|string|different:origin|in:' . $validCities,
            'date' => 'required|date|after_or_equal:today',
            'passengers' => 'nullable|integer|min:1|max:9',
        ], [
            'origin.in' => 'Please enter a valid city like Casablanca, Paris, or Dubai.',
            'destination.in' => 'Please enter a valid city.',
            'destination.different' => 'Destination cannot be the same as the origin.'
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
        $validCities = 'casablanca,rabat,marrakech,tangier,agadir,fes,meknes,oujda,nador,tetouan,essaouira,dakhla,laayoune,chefchaouen,safi,el jadida,kenitra,taza,taroudant,guelmim,errachidia,ouarzazate,tiznit,zagora,khenifra,khouribga,beni mellal,khemisset,settat,berrechid';

        $request->merge([
            'origin' => strtolower($request->origin ?? ''),
            'destination' => strtolower($request->destination ?? ''),
        ]);

        $request->validate([
            'origin' => 'required|string|in:' . $validCities,
            'destination' => 'required|string|different:origin|in:' . $validCities,
            'date' => 'required|date|after_or_equal:today',
            'passengers' => 'nullable|integer|min:1|max:9',
        ], [
            'origin.in' => 'Fake inputs are not allowed. Please enter a real Moroccan city (e.g., Casablanca, Marrakech).',
            'destination.in' => 'Fake inputs are not allowed. Please enter a real Moroccan city.',
            'destination.different' => 'Destination cannot be the same as the origin.'
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

    /**
     * Search for trains via external API integration.
     */
    public function searchTrains(Request $request)
    {
        $validCities = 'casablanca,rabat,marrakech,tangier,fes,meknes,oujda,nador,kenitra,settat,safi,el jadida,taza,khouribga,benguerir,berrechid,mohammedia,sale,asilah,ksar el kebir';

        $request->merge([
            'origin' => strtolower($request->origin ?? ''),
            'destination' => strtolower($request->destination ?? ''),
        ]);

        $request->validate([
            'origin' => 'required|string|in:' . $validCities,
            'destination' => 'required|string|different:origin|in:' . $validCities,
            'date' => 'required|date|after_or_equal:today',
            'passengers' => 'nullable|integer|min:1|max:9',
        ], [
            'origin.in' => 'Please enter a valid Moroccan train city (e.g., Tangier, Rabat).',
            'destination.in' => 'Please enter a valid Moroccan train city.',
            'destination.different' => 'Destination cannot be the same as the origin.'
        ]);

        try {
            $trains = $this->trainService->searchTrains(
                $request->origin,
                $request->destination,
                $request->date,
                $request->passengers ?? 1
            );

            return response()->json([
                'status' => 'success',
                'data' => $trains,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve trains: ' . $e->getMessage()
            ], 500);
        }
    }

    public function discoverFlights(Request $request)
    {
        $origin = strtolower($request->query('origin', 'casablanca'));
        $destinations = ['tunis', 'cairo', 'dubai', 'doha', 'riyadh'];
        $results = [];
        $date = date('Y-m-d', strtotime('+1 day'));
        foreach ($destinations as $dest) {
            if ($dest !== $origin) {
                $flights = $this->flightService->searchFlights($origin, $dest, $date, null, 1);
                if (isset($flights[0])) $results[] = $flights[0];
            }
        }
        return response()->json(['status' => 'success', 'data' => array_slice($results, 0, 4)]);
    }

    public function discoverBuses(Request $request)
    {
        $origin = strtolower($request->query('origin', 'casablanca'));
        $destinations = ['marrakech', 'agadir', 'tangier', 'fes', 'chefchaouen'];
        $results = [];
        $date = date('Y-m-d', strtotime('+1 day'));
        foreach ($destinations as $dest) {
            if ($dest !== $origin) {
                $buses = $this->busService->searchBuses($origin, $dest, $date, 1);
                if (isset($buses[0])) $results[] = $buses[0];
            }
        }
        return response()->json(['status' => 'success', 'data' => array_slice($results, 0, 4)]);
    }

    public function discoverTrains(Request $request)
    {
        $origin = strtolower($request->query('origin', 'casablanca'));
        $destinations = ['tangier', 'rabat', 'marrakech', 'fes', 'kenitra'];
        $results = [];
        $date = date('Y-m-d', strtotime('+1 day'));
        foreach ($destinations as $dest) {
            if ($dest !== $origin) {
                $trains = $this->trainService->searchTrains($origin, $dest, $date, 1);
                if (isset($trains[0])) $results[] = $trains[0];
            }
        }
        return response()->json(['status' => 'success', 'data' => array_slice($results, 0, 4)]);
    }
}
