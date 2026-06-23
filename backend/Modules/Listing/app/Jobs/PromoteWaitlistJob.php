<?php

namespace Modules\Listing\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

use Modules\Listing\Models\EventWaitlist;
use Modules\Listing\Models\ListingTicket;
use Illuminate\Support\Facades\Mail;
use Modules\Listing\Emails\WaitlistPromotedMail;

class PromoteWaitlistJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $ticketTierId;

    /**
     * Create a new job instance.
     */
    public function __construct($ticketTierId)
    {
        $this->ticketTierId = $ticketTierId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $ticketTier = ListingTicket::find($this->ticketTierId);
        if (!$ticketTier || $ticketTier->quantity_available <= 0) {
            return;
        }

        $waitlist = EventWaitlist::where('ticket_tier_id', $this->ticketTierId)
            ->where('status', 'waiting')
            ->orderBy('created_at', 'asc')
            ->first();

        if ($waitlist) {
            // Reserve the ticket for this user
            $ticketTier->decrement('quantity_available');
            
            // Update waitlist status
            $waitlist->update([
                'status' => 'invited',
                'expires_at' => now()->addHours(24)
            ]);

            // Send Email
            Mail::to($waitlist->user->email)->send(new WaitlistPromotedMail($waitlist));
        }
    }
}
