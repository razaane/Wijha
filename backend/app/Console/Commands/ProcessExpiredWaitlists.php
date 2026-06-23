<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\Listing\Models\EventWaitlist;
use Modules\Listing\Models\ListingTicket;
use Modules\Listing\Jobs\PromoteWaitlistJob;

class ProcessExpiredWaitlists extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'waitlist:process';

    /**
     * The console command description.
     */
    protected $description = 'Process expired waitlist invitations and promote the next users.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredWaitlists = EventWaitlist::where('status', 'invited')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredWaitlists as $waitlist) {
            $waitlist->update(['status' => 'expired']);

            $ticketTier = ListingTicket::find($waitlist->ticket_tier_id);
            if ($ticketTier) {
                $ticketTier->increment('quantity_available');
                PromoteWaitlistJob::dispatch($ticketTier->id);
            }
        }

        $this->info("Processed {$expiredWaitlists->count()} expired waitlists.");
    }
}
