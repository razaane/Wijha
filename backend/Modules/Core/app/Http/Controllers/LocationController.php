<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\City;
use Modules\Core\Models\Region;
use Modules\Core\Transformers\CityResource;
use Modules\Core\Transformers\RegionResource;

class LocationController extends CoreController
{
    /**
     * Get all regions.
     */
    public function getRegions(Request $request): JsonResponse
    {
        $regions = Region::query()->get();

        return $this->successResponse(
            RegionResource::collection($regions),
            'Regions retrieved successfully.'
        );
    }

    /**
     * Get all cities, optionally filtered by region_id.
     */
    public function getCities(Request $request): JsonResponse
    {
        $query = City::query()->with('region');

        if ($request->has('region_id')) {
            $query->where('region_id', $request->region_id);
        }

        $cities = $query->get();

        return $this->successResponse(
            CityResource::collection($cities),
            'Cities retrieved successfully.'
        );
    }
}
