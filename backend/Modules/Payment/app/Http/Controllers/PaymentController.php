<?php

namespace Modules\Payment\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Payment\Models\Payment;
use Modules\Core\Traits\ApiResponse;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * List payments for the authenticated user (as guest or host).
     *
     * GET /api/v1/payment/me
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Payment::with(['booking.listing'])
            ->where(function ($q) use ($userId) {
                $q->where('host_id', $userId)
                  ->orWhereHas('booking', function ($bq) use ($userId) {
                      $bq->where('user_id', $userId);
                  });
            });

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->paginate(15);

        return $this->successResponse($payments, 'Payments retrieved successfully.');
    }

    /**
     * Show a specific payment.
     *
     * GET /api/v1/payment/{id}
     */
    public function show($id)
    {
        $userId = Auth::id();

        $payment = Payment::with(['booking.listing'])
            ->where('id', $id)
            ->where(function ($q) use ($userId) {
                $q->where('host_id', $userId)
                  ->orWhereHas('booking', function ($bq) use ($userId) {
                      $bq->where('user_id', $userId);
                  });
            })
            ->first();

        if (!$payment) {
            return $this->errorResponse('not_found', 'Payment not found.', 404);
        }

        return $this->successResponse($payment, 'Payment retrieved successfully.');
    }

    /**
     * Create a payment for a booking.
     *
     * POST /api/v1/payment/bookings/{bookingId}/pay
     *
     * TODO: Integrate Stripe payment processing here.
     * Steps needed:
     * 1. Install stripe/stripe-php via composer
     * 2. Add STRIPE_KEY and STRIPE_SECRET to .env
     * 3. Create a PaymentIntent or Charge using the Stripe SDK
     * 4. Store the stripe_charge_id on success
     * 5. Set up Stripe webhooks for async payment confirmations
     */
    public function store(Request $request, $bookingId)
    {
        return $this->errorResponse(
            'not_implemented',
            'Payment processing is not yet available. Stripe integration coming soon.',
            501
        );
    }

    /**
     * Get aggregated earnings data for the authenticated host.
     *
     * GET /api/v1/payment/earnings
     */
    public function earnings()
    {
        $userId = Auth::id();

        // Total held in escrow
        $totalEscrow = Payment::where('host_id', $userId)
            ->where('status', 'held_in_escrow')
            ->sum('amount');

        // Total paid out
        $totalPaidOut = Payment::where('host_id', $userId)
            ->where('status', 'paid_out')
            ->sum('amount');

        // Upcoming payouts (payments held in escrow)
        $upcomingPayouts = Payment::with(['booking.listing'])
            ->where('host_id', $userId)
            ->where('status', 'held_in_escrow')
            ->orderBy('release_date', 'asc')
            ->get();

        return $this->successResponse([
            'total_escrow' => (float) $totalEscrow,
            'total_paid_out' => (float) $totalPaidOut,
            'available_to_withdraw' => 0, // Handled automatically by cron for now
            'upcoming_payouts' => $upcomingPayouts
        ], 'Earnings retrieved successfully.');
    }
}
