<?php

namespace Modules\Booking\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Booking\Models\Booking;
use Modules\Listing\Models\Listing;
use Modules\Core\Traits\ApiResponse;

class BookingController extends Controller
{
    use ApiResponse;

    /**
     * List all bookings for the authenticated user.
     *
     * GET /api/v1/bookings
     */
    public function index(Request $request)
    {
        $query = Booking::where('user_id', Auth::id())
            ->with(['listing', 'listing.eventMeta', 'ticket', 'payment']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->paginate(15);

        return $this->successResponse($bookings, 'Bookings retrieved successfully.');
    }

    /**
     * Create a new booking.
     *
     * POST /api/v1/bookings
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'required|integer|exists:listings,id',
            'listing_ticket_id' => 'nullable|integer|exists:listing_tickets,id',
            'check_in' => 'nullable|date|after_or_equal:today',
            'check_out' => 'nullable|date|after:check_in',
            'guests_count' => 'nullable|integer|min:1',
        ]);

        // Fetch the listing
        $listing = Listing::with(['eventMeta', 'tickets'])->findOrFail($validated['listing_id']);

        // Verify listing is bookable
        if (!$listing->is_active || $listing->is_draft) {
            return $this->errorResponse(
                'listing_unavailable',
                'This listing is not currently available for booking.',
                422
            );
        }

        // Prevent booking your own listing
        if ($listing->user_id === Auth::id()) {
            return $this->errorResponse(
                'self_booking',
                'You cannot book your own listing.',
                422
            );
        }

        $totalAmount = 0;
        $currency = $listing->currency ?? 'USD';

        // Rental-type validations
        if ($listing->type === 'rental') {
            if (empty($validated['check_in']) || empty($validated['check_out'])) {
                return $this->errorResponse(
                    'dates_required',
                    'Check-in and check-out dates are required for rental bookings.',
                    422
                );
            }

            // Check guest capacity
            if (
                !empty($validated['guests_count']) &&
                $listing->guests_count &&
                $validated['guests_count'] > $listing->guests_count
            ) {
                return $this->errorResponse(
                    'capacity_exceeded',
                    "This listing accommodates a maximum of {$listing->guests_count} guests.",
                    422
                );
            }

            // Check for overlapping confirmed bookings
            $overlap = Booking::where('listing_id', $listing->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where(function ($q) use ($validated) {
                    $q->where('check_in', '<', $validated['check_out'])
                      ->where('check_out', '>', $validated['check_in']);
                })
                ->exists();

            if ($overlap) {
                return $this->errorResponse(
                    'dates_unavailable',
                    'The selected dates are not available for this listing.',
                    409
                );
            }

            // Calculate total: price per night × number of nights
            $checkIn = \Carbon\Carbon::parse($validated['check_in']);
            $checkOut = \Carbon\Carbon::parse($validated['check_out']);
            $nights = $checkIn->diffInDays($checkOut);
            $totalAmount = $listing->price * $nights;
        }

        // Event-type validations
        if ($listing->type === 'event') {
            if (!empty($validated['listing_ticket_id'])) {
                $ticket = $listing->tickets()->find($validated['listing_ticket_id']);

                if (!$ticket) {
                    return $this->errorResponse(
                        'invalid_ticket',
                        'The selected ticket does not belong to this listing.',
                        422
                    );
                }

                if ($ticket->quantity_available <= 0) {
                    return $this->errorResponse(
                        'sold_out',
                        'This ticket type is sold out.',
                        422
                    );
                }

                // Decrement available quantity
                $ticket->decrement('quantity_available');
                $totalAmount = $ticket->price;
                $currency = $ticket->currency ?? $currency;
            } else {
                $totalAmount = $listing->price;
            }
        }

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'listing_id' => $listing->id,
            'listing_ticket_id' => $validated['listing_ticket_id'] ?? null,
            'check_in' => $validated['check_in'] ?? null,
            'check_out' => $validated['check_out'] ?? null,
            'guests_count' => $validated['guests_count'] ?? null,
            'total_amount' => $totalAmount,
            'currency' => $currency,
            'status' => 'confirmed', // Auto-confirm for mock payment
        ]);

        // Calculate release date for Escrow
        $releaseDate = null;
        if ($listing->type === 'rental' && $booking->check_in) {
            $releaseDate = \Carbon\Carbon::parse($booking->check_in)->addHours(24);
        } elseif ($listing->type === 'event' && $listing->eventMeta && $listing->eventMeta->end_datetime) {
            $releaseDate = \Carbon\Carbon::parse($listing->eventMeta->end_datetime)->addHours(48);
        }

        // Mock Payment Creation for Escrow System
        if ($totalAmount > 0) {
            \Modules\Payment\Models\Payment::create([
                'booking_id' => $booking->id,
                'host_id' => $listing->user_id,
                'amount' => $totalAmount,
                'currency' => $currency,
                'status' => 'held_in_escrow',
                'release_date' => $releaseDate,
            ]);
        }

        $booking->load(['listing', 'ticket', 'payment']);

        return $this->successResponse($booking, 'Booking created and paid successfully.', 201);
    }

    /**
     * Show a specific booking.
     *
     * GET /api/v1/bookings/{id}
     */
    public function show($id)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', Auth::id())
            ->with(['listing', 'listing.eventMeta', 'ticket', 'payment', 'disputes'])
            ->first();

        if (!$booking) {
            return $this->errorResponse('not_found', 'Booking not found.', 404);
        }

        return $this->successResponse($booking, 'Booking retrieved successfully.');
    }

    /**
     * Update a booking (status transitions).
     *
     * PUT /api/v1/bookings/{id}
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::with('listing')->where('id', $id)->first();

        if (!$booking) {
            return $this->errorResponse('not_found', 'Booking not found.', 404);
        }

        // Authorization: booking owner or listing owner can update
        $userId = Auth::id();
        if ($booking->user_id !== $userId && $booking->listing->user_id !== $userId) {
            return $this->errorResponse('unauthorized', 'You are not authorized to update this booking.', 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:confirmed,cancelled',
        ]);

        $currentStatus = $booking->status;
        $newStatus = $validated['status'];

        // Validate status transitions
        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['cancelled'],
        ];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return $this->errorResponse(
                'invalid_transition',
                "Cannot change booking status from '{$currentStatus}' to '{$newStatus}'.",
                422
            );
        }

        // Only the listing owner (host) can confirm bookings
        if ($newStatus === 'confirmed' && $booking->listing->user_id !== $userId) {
            return $this->errorResponse(
                'unauthorized',
                'Only the host can confirm a booking.',
                403
            );
        }

        // If cancelling an event booking, restore ticket quantity
        if ($newStatus === 'cancelled' && $booking->listing_ticket_id) {
            $ticket = $booking->ticket;
            if ($ticket) {
                $ticket->increment('quantity_available');
                \Modules\Listing\Jobs\PromoteWaitlistJob::dispatch($ticket->id);
            }
        }

        $booking->update(['status' => $newStatus]);
        $booking->load(['listing', 'ticket', 'payment']);

        return $this->successResponse($booking, "Booking {$newStatus} successfully.");
    }

    /**
     * Cancel (soft delete) a booking.
     *
     * DELETE /api/v1/bookings/{id}
     */
    public function destroy($id)
    {
        $booking = Booking::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$booking) {
            return $this->errorResponse('not_found', 'Booking not found.', 404);
        }

        if ($booking->status === 'cancelled') {
            return $this->errorResponse('already_cancelled', 'This booking is already cancelled.', 422);
        }

        // Restore ticket quantity if event booking
        if ($booking->listing_ticket_id) {
            $ticket = $booking->ticket;
            if ($ticket) {
                $ticket->increment('quantity_available');
                \Modules\Listing\Jobs\PromoteWaitlistJob::dispatch($ticket->id);
            }
        }

        $booking->update(['status' => 'cancelled']);

        return $this->successResponse(null, 'Booking cancelled successfully.');
    }

    /**
     * Scan a ticket for an event.
     *
     * POST /api/v1/bookings/scan
     */
    public function scanTicket(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|integer',
            'ticket_code' => 'required|string',
            'listing_id' => 'required|integer',
        ]);

        $booking = Booking::with(['listing', 'user', 'ticket'])->find($validated['booking_id']);

        if (!$booking) {
            return $this->errorResponse('not_found', 'Booking not found.', 404);
        }

        // Verify the authenticated user is the host of the listing
        if ($booking->listing->user_id !== Auth::id()) {
            return $this->errorResponse('unauthorized', 'You are not authorized to scan this ticket.', 403);
        }

        // Verify the ticket belongs to the selected event
        if ($booking->listing_id != $validated['listing_id']) {
            return $this->errorResponse('invalid_event', 'This ticket is for a different event.', 400);
        }

        // Verify the event date has started (allow scanning on the day of the event)
        if ($booking->check_in && now()->startOfDay()->lt($booking->check_in->startOfDay())) {
            return $this->errorResponse('too_early', 'This event has not started yet. Tickets can only be scanned on or after the event date.', 400);
        }

        // Verify ticket code (current naive verification WJ-booking_id-user_id)
        $expectedCode = "WJ-{$booking->id}-{$booking->user_id}";
        if ($validated['ticket_code'] !== $expectedCode) {
            return $this->errorResponse('invalid_ticket', 'Invalid ticket code.', 400);
        }

        // Check if already scanned
        if ($booking->scanned_at) {
            return $this->errorResponse(
                'already_scanned', 
                'Ticket has already been scanned at ' . $booking->scanned_at->format('Y-m-d H:i:s'), 
                400
            );
        }

        // Mark as scanned
        $booking->update(['scanned_at' => now()]);

        return $this->successResponse([
            'booking_id' => $booking->id,
            'guest_name' => $booking->user->name ?? 'Guest',
            'ticket_type' => $booking->ticket->name ?? 'General Admission',
            'scanned_at' => $booking->scanned_at,
        ], 'Ticket successfully scanned!');
    }
}
