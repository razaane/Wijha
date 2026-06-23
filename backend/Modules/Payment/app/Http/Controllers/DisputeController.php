<?php

namespace Modules\Payment\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Booking\Models\Booking;
use Modules\Payment\Models\Dispute;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DisputeController extends Controller
{
    use ApiResponse;

    /**
     * Store a newly created dispute.
     */
    public function store(Request $request, $bookingId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'evidence_text' => 'required|string|min:10',
        ]);

        $booking = Booking::with('listing.eventMeta')->findOrFail($bookingId);

        // Check if the current user owns the booking
        if ($booking->user_id !== Auth::id()) {
            return $this->errorResponse('unauthorized', 'You are not authorized to dispute this booking.', 403);
        }

        // Check if a dispute already exists
        if ($booking->disputes()->where('status', 'open')->exists()) {
            return $this->errorResponse('already_disputed', 'An open dispute already exists for this booking.', 400);
        }

        // Verify time window (must be within 48h after the event ends)
        if ($booking->listing->type === 'event' && $booking->listing->eventMeta) {
            $endDatetime = Carbon::parse($booking->listing->eventMeta->end_datetime);
            $deadline = $endDatetime->copy()->addHours(48);

            if (Carbon::now()->greaterThan($deadline)) {
                return $this->errorResponse('deadline_passed', 'The 48-hour dispute window has passed.', 400);
            }
        }

        $dispute = Dispute::create([
            'booking_id' => $booking->id,
            'user_id' => Auth::id(),
            'reason' => $request->reason,
            'evidence_text' => $request->evidence_text,
            'status' => 'open',
        ]);

        return $this->successResponse($dispute, 'Dispute opened successfully. The payment to the host has been frozen.', 201);
    }
}
