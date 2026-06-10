<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Modules\Listing\Events\ListingCreated;

class ListingController extends Controller
{
    /**
     * Store a newly created listing in storage.
     * Accepts multipart/form-data with photo files.
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
            'has_locks' => 'nullable',

            // JSON arrays (sent as JSON strings via FormData)
            'amenities' => 'nullable',
            'safety_items' => 'nullable',

            // Photo files
            'photos' => 'required|array|min:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max per photo
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Decode JSON strings if sent via FormData
        if (is_string($validated['amenities'] ?? null)) {
            $validated['amenities'] = json_decode($validated['amenities'], true) ?? [];
        }
        if (is_string($validated['safety_items'] ?? null)) {
            $validated['safety_items'] = json_decode($validated['safety_items'], true) ?? [];
        }

        // Convert has_locks string to boolean (FormData sends strings)
        if (isset($validated['has_locks'])) {
            $validated['has_locks'] = filter_var($validated['has_locks'], FILTER_VALIDATE_BOOLEAN);
        }

        // Remove photos from validated data — handled by MediaLibrary
        unset($validated['photos']);

        $listing = new Listing($validated);
        $listing->user_id = $user->id;
        $listing->save();

        // Attach uploaded photos via Spatie MediaLibrary
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $listing->addMedia($photo)
                    ->toMediaCollection('photos');
            }
        }

        // Fire the ListingCreated event. The Auth module listens to this
        // to handle role upgrades (e.g., User -> Partner).
        ListingCreated::dispatch($listing);

        return response()->json([
            'success' => true,
            'message' => 'Listing created successfully.',
            'data' => [
                'listing' => array_merge($listing->toArray(), [
                    'photos' => $listing->photo_urls,
                ]),
                'user' => $user,
            ]
        ], 201);
    }
}
