<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\Models\Listing;
use Modules\Listing\Models\ListingAvailability;
use Modules\Core\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

class ListingCalendarController extends Controller
{
    use ApiResponse;

    /**
     * Get availability for a specific listing.
     * GET /api/v1/listings/{id}/calendar
     */
    public function index($id)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        // We could filter by date range here if needed, 
        // but for now we'll just return all availabilities for this listing
        $availabilities = ListingAvailability::where('listing_id', $id)->get();

        return $this->successResponse([
            'base_price' => $listing->price,
            'availabilities' => $availabilities
        ]);
    }

    /**
     * Update availability for a specific listing.
     * PUT /api/v1/listings/{id}/calendar
     */
    public function update(Request $request, $id)
    {
        $listing = Listing::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$listing) {
            return $this->errorResponse('not_found', 'Listing not found.', 404);
        }

        $request->validate([
            'dates' => 'required|array',
            'dates.*' => 'required|date',
            'status' => 'required|in:available,blocked,booked',
            'custom_price' => 'nullable|numeric|min:0'
        ]);

        $dates = $request->input('dates');
        $status = $request->input('status');
        $customPrice = $request->input('custom_price');

        $upsertData = [];
        foreach ($dates as $date) {
            $upsertData[] = [
                'listing_id' => $listing->id,
                'date' => $date,
                'status' => $status,
                'custom_price' => $customPrice,
                // In SQLite/MySQL upserts we typically need these, but since we are using Laravel 11's upsert:
            ];
        }

        // Use upsert to efficiently create or update existing dates
        ListingAvailability::upsert(
            $upsertData,
            ['listing_id', 'date'], // unique columns
            ['status', 'custom_price'] // columns to update if exists
        );

        return $this->successResponse(message: 'Calendar updated successfully.');
    }
}
