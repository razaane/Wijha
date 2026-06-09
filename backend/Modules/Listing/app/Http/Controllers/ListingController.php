<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ListingController extends Controller
{
    /**
     * Store a newly created listing in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            
            // Rental specific
            'property_type' => 'nullable|string',
            'privacy_type' => 'nullable|string',
            
            // Address
            'address_country' => 'nullable|string',
            'address_street' => 'nullable|string',
            'address_apt' => 'nullable|string',
            'address_city' => 'nullable|string',
            'address_province' => 'nullable|string',
            'address_postal_code' => 'nullable|string',
            
            // Map
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            // Floor Plan
            'guests_count' => 'nullable|integer|min:1',
            'bedrooms_count' => 'nullable|integer|min:0',
            'beds_count' => 'nullable|integer|min:0',
            'bathrooms_count' => 'nullable|integer|min:0',
            'has_locks' => 'nullable|boolean',

            // JSON arrays
            'amenities' => 'nullable|array',
            'safety_items' => 'nullable|array',
            'photos' => 'nullable|array',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $listing = new Listing($validated);
        $listing->user_id = $user->id;
        $listing->save();

        // Upgrade user to partner if they aren't one already
        if ($user->role !== User::ROLE_PARTNER && $user->role !== User::ROLE_ADMIN) {
            $user->role = User::ROLE_PARTNER;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Listing created successfully.',
            'data' => [
                'listing' => $listing,
                'user' => $user
            ]
        ], 201);
    }
}
