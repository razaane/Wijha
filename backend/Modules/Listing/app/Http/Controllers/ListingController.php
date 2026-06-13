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
            'currency' => 'nullable|string|max:3',
            
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

            // Event Specific
            'venue_name' => 'nullable|string',
            'age_restriction' => 'nullable|string',
            'start_datetime' => 'nullable|date',
            'end_datetime' => 'nullable|date',
            'is_waitlist_enabled' => 'nullable',
            'tickets' => 'nullable',

            // Photo files
            'photos' => $isDraft ? 'nullable|array' : 'required|array|min:' . ($request->input('type') === 'event' ? '1' : '5'),
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

        // Handle Event-specific creations
        if ($validated['type'] === 'event') {
            $listing->eventMeta()->create([
                'venue_name' => $validated['venue_name'] ?? null,
                'age_restriction' => $validated['age_restriction'] ?? null,
                'start_datetime' => $validated['start_datetime'] ?? null,
                'end_datetime' => $validated['end_datetime'] ?? null,
                'is_waitlist_enabled' => isset($validated['is_waitlist_enabled']) ? filter_var($validated['is_waitlist_enabled'], FILTER_VALIDATE_BOOLEAN) : false,
            ]);

            // All new events start as pending review
            $listing->eventVerification()->create([
                'status' => 'pending'
            ]);

            if (isset($validated['tickets']) && is_string($validated['tickets'])) {
                $tickets = json_decode($validated['tickets'], true) ?? [];
                foreach ($tickets as $ticket) {
                    // Only create if there's a name, to prevent empty drafts from failing
                    if (!empty($ticket['name'])) {
                        $listing->tickets()->create([
                            'name' => $ticket['name'],
                            'price' => $ticket['price'] ?? 0,
                            'currency' => $validated['currency'] ?? 'USD',
                            'quantity_available' => $ticket['quantity_available'] ?? 0,
                            'description' => $ticket['description'] ?? null,
                        ]);
                    }
                }
            }
        }

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
        $listing = Listing::with(['eventMeta', 'tickets'])->where('id', $id)
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
            'currency' => 'sometimes|string|max:3',
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
            'event_meta' => 'sometimes|array',
            'event_meta.start_datetime' => 'nullable|date',
            'event_meta.end_datetime' => 'nullable|date|after_or_equal:event_meta.start_datetime',
            'event_meta.venue_name' => 'nullable|string|max:255',
            'event_meta.age_restriction' => 'nullable|string|max:50',
            'event_meta.is_waitlist_enabled' => 'nullable|boolean',
            'tickets' => 'sometimes',
        ]);

        $listing->update($validated);

        if ($request->has('event_meta')) {
            $metaData = $request->input('event_meta');
            $listing->eventMeta()->updateOrCreate(
                ['listing_id' => $listing->id],
                [
                    'start_datetime' => $metaData['start_datetime'] ?? null,
                    'end_datetime' => $metaData['end_datetime'] ?? null,
                    'venue_name' => $metaData['venue_name'] ?? null,
                    'age_restriction' => $metaData['age_restriction'] ?? null,
                    'is_waitlist_enabled' => $metaData['is_waitlist_enabled'] ?? false,
                ]
            );
        }

        if (isset($validated['tickets']) && is_string($validated['tickets'])) {
            $tickets = json_decode($validated['tickets'], true) ?? [];
            $listing->tickets()->delete();
            foreach ($tickets as $ticket) {
                if (!empty($ticket['name'])) {
                    $listing->tickets()->create([
                        'name' => $ticket['name'],
                        'price' => $ticket['price'] ?? 0,
                        'currency' => $validated['currency'] ?? $listing->currency ?? 'USD',
                        'quantity_available' => $ticket['quantity_available'] ?? 0,
                        'description' => $ticket['description'] ?? null,
                    ]);
                }
            }
        }

        $listing->load(['eventMeta', 'tickets']);
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

    /**
     * Delete a specific photo from a listing.
     */
    public function destroyPhoto($id, $photoId)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $media = $listing->getMedia('photos')->where('id', $photoId)->first();

        if (!$media) {
            return $this->errorResponse('not_found', 'Photo not found.', 404);
        }

        $media->delete();

        // Refresh the listing media relations
        $listing->load('media');
        $listing->append('photo_urls');

        return $this->successResponse($listing, 'Photo deleted successfully.');
    }

    /**
     * Upload new photos to a listing.
     */
    public function uploadPhotos($id, Request $request)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max per photo
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $listing->addMedia($photo)
                    ->toMediaCollection('photos');
            }
        }

        // Refresh the listing media relations
        $listing->load('media');
        $listing->append('photo_urls');

        return $this->successResponse($listing, 'Photos uploaded successfully.');
    }

    /**
     * Reorder photos for a listing.
     */
    public function reorderPhotos($id, Request $request)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $request->validate([
            'photo_ids' => 'required|array',
            'photo_ids.*' => 'integer|exists:media,id'
        ]);

        \Spatie\MediaLibrary\MediaCollections\Models\Media::setNewOrder($request->photo_ids);

        // Refresh the listing media relations
        $listing->load('media');
        $listing->append('photo_urls');

        return $this->successResponse($listing, 'Photos reordered successfully.');
    }
}
