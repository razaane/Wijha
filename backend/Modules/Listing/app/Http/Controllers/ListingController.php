<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Modules\Listing\Events\ListingCreated;
use Modules\Core\Traits\ApiResponse;

class ListingController extends Controller
{
    use ApiResponse;

    /**
     * Store a newly created listing in storage.
     * Accepts multipart/form-data with photo files.
     */
    public function store(Request $request)
    {
        $isDraft = filter_var($request->input('is_draft', false), FILTER_VALIDATE_BOOLEAN);

        $validated = $request->validate([
            'is_draft' => 'nullable|boolean',
            'type' => 'required|string',
            'title' => $isDraft ? 'nullable|string' : 'required|string',
            'description' => 'nullable|string',
            'price' => $isDraft ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            
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
            'photos' => $isDraft ? 'nullable|array' : 'required|array|min:5',
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
        $listing->is_draft = $isDraft;
        $listing->is_active = !$isDraft; // Drafts are not active
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

        return $this->successResponse([
            'listing' => array_merge($listing->toArray(), [
                'photos' => $listing->photo_urls,
            ]),
            'user' => $user,
        ], 'Listing created successfully.', 201);
    }

    /**
     * Get all listings for the authenticated user.
     * GET /api/v1/listings/me
     */
    public function myListings(Request $request)
    {
        $listings = Listing::where('user_id', Auth::id())
            ->latest()
            ->paginate(15);
            
        // Append photo_urls to each item in the collection
        $listings->getCollection()->transform(function ($listing) {
            return $listing->append('photo_urls');
        });

        return $this->successResponse($listings);
    }

    /**
     * Get a specific listing by ID.
     */
    public function show($id)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $listing->append('photo_urls');

        return $this->successResponse($listing);
    }

    /**
     * Update a specific listing.
     */
    public function update(Request $request, $id)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $validated = $request->validate([
            'is_draft' => 'sometimes|boolean',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:1',
            'guests_count' => 'sometimes|integer|min:1',
            'bedrooms_count' => 'sometimes|integer|min:0',
            'beds_count' => 'sometimes|integer|min:1',
            'bathrooms_count' => 'sometimes|numeric|min:0',
            'property_type' => 'sometimes|string',
            'privacy_type' => 'sometimes|string',
            'amenities' => 'sometimes|array',
            'safety_items' => 'sometimes|array',
            'address_country' => 'sometimes|string',
            'address_city' => 'sometimes|string',
            'address_street' => 'sometimes|string',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'is_active' => 'sometimes|boolean',
        ]);

        $listing->update($validated);

        $listing->append('photo_urls');

        return $this->successResponse($listing, 'Listing updated successfully.');
    }

    /**
     * Delete a specific listing.
     */
    public function destroy($id)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $listing->delete();

        return $this->successResponse(null, 'Listing deleted successfully.');
    }
}
