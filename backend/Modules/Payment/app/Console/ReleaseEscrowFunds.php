<?php

namespace Modules\Payment\Console;

use Illuminate\Console\Command;
use Modules\Payment\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReleaseEscrowFunds extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'escrow:release';

    /**
     * The console command description.
     */
    protected $description = 'Releases funds to host after 48 hours post-event if no open disputes exist.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting escrow release process...');

        $payments = Payment::where('status', 'held_in_escrow')
            ->with(['booking.listing.eventMeta', 'booking.disputes'])
            ->get();

        $releasedCount = 0;

        foreach ($payments as $payment) {
            $booking = $payment->booking;
            
            // Check for open disputes
            $hasOpenDispute = $booking->disputes->contains('status', 'open');
            if ($hasOpenDispute) {
                continue; // Skip, funds are frozen
            }

            $listing = $booking->listing;

            if ($listing->type === 'event' && $listing->eventMeta) {
                $endDatetime = Carbon::parse($listing->eventMeta->end_datetime);
                $releaseTime = $endDatetime->addHours(48);

                if (Carbon::now()->greaterThanOrEqualTo($releaseTime)) {
                    // Release the funds
                    $payment->update(['status' => 'paid_out']);
                    
                    // TODO: In a real environment, trigger Stripe Transfer API here
                    Log::info("Released escrow funds for payment ID {$payment->id} (Booking {$booking->id})");
                    
                    $releasedCount++;
                }
            } else if ($listing->type === 'rental') {
                // For rentals, we could check checkout date instead
                // Placeholder for rental logic
            }
        }

        $this->info("Escrow release completed. Released {$releasedCount} payments.");
    }
}
