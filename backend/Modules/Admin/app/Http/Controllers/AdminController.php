<?php

namespace Modules\Admin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use App\Models\User;
use Modules\Auth\Models\IdentityVerification;
use Modules\Listing\Models\Listing;
use Modules\Payment\Models\Payment;

class AdminController extends Controller
{
    use ApiResponse;

    /**
     * Get real statistics for the Admin Dashboard overview.
     */
    public function stats()
    {
        $pendingKyc = IdentityVerification::where('status', 'pending')->count();
        $totalUsers = User::count();
        $activeListings = Listing::where('is_active', true)->where('is_draft', false)->count();
        
        // Sum of all payment amounts for the current month
        // Assuming we have a Payment model and we want it in MAD
        $monthlyRevenue = 0;
        if (class_exists(\Modules\Payment\Models\Payment::class)) {
            $monthlyRevenue = Payment::where('status', 'succeeded')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount');
        }

        // Convert cents to standard currency format if Stripe was used, else just format
        $monthlyRevenueFormatted = number_format($monthlyRevenue, 2) . ' MAD';

        return $this->successResponse([
            'pending_kyc' => $pendingKyc,
            'total_users' => $totalUsers,
            'active_listings' => $activeListings,
            'monthly_revenue' => $monthlyRevenueFormatted,
        ], 'Dashboard stats retrieved successfully.');
    }
}
