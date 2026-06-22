<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Listing\Models\Listing;
use Modules\Booking\Models\Booking;
use Modules\Payment\Models\Payment;
use Modules\Core\Traits\ApiResponse;
use Carbon\Carbon;

class HostInsightsController extends Controller
{
    use ApiResponse;

    /**
     * Get aggregated analytics for the authenticated host.
     *
     * GET /api/v1/host/insights
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        // 1. Total Active Listings
        $totalListings = Listing::where('user_id', $userId)
            ->where('is_active', true)
            ->where('is_draft', false)
            ->count();

        // 2. Total Bookings (Confirmed/Pending)
        $totalBookings = Booking::whereHas('listing', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        // 3. Total Revenue (Paid out + Escrow)
        $totalRevenue = Payment::where('host_id', $userId)
            ->whereIn('status', ['paid_out', 'held_in_escrow'])
            ->sum('amount');

        // 4. Monthly Revenue Chart Data (Last 6 Months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenue = Payment::where('host_id', $userId)
                ->whereIn('status', ['paid_out', 'held_in_escrow'])
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');

            $monthlyRevenue[] = [
                'name' => $month->format('M Y'),
                'revenue' => (float) $revenue
            ];
        }

        // 5. Top Performing Listings
        $topListings = Listing::where('user_id', $userId)
            ->withCount(['bookings' => function ($query) {
                $query->whereIn('status', ['confirmed', 'pending']);
            }])
            ->orderBy('bookings_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($listing) {
                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'type' => $listing->type,
                    'bookings_count' => $listing->bookings_count,
                    'photo' => $listing->photos?->first()?->original_url ?? null
                ];
            });

        // 6. Occupancy Rate Mock (Usually requires complex date math against calendar)
        // For now, we return a simulated healthy percentage based on booking count
        $occupancyRate = $totalBookings > 0 ? min(100, ($totalBookings * 15)) : 0;

        return $this->successResponse([
            'metrics' => [
                'total_listings' => $totalListings,
                'total_bookings' => $totalBookings,
                'total_revenue' => (float) $totalRevenue,
                'occupancy_rate' => $occupancyRate,
            ],
            'revenue_chart' => $monthlyRevenue,
            'top_listings' => $topListings
        ], 'Host insights retrieved successfully.');
    }
}
