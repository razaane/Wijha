<?php

namespace Modules\Payment\Console;

use Illuminate\Console\Command;
use Modules\Payment\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProcessEscrowPayouts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'escrow:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process and release eligible escrow funds to hosts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting escrow payout processing...');

        // Find payments held in escrow where the release date has passed
        $paymentsToRelease = Payment::where('status', 'held_in_escrow')
            ->whereNotNull('release_date')
            ->where('release_date', '<=', Carbon::now())
            ->get();

        if ($paymentsToRelease->isEmpty()) {
            $this->info('No escrow payouts pending release.');
            return;
        }

        $this->info('Found ' . $paymentsToRelease->count() . ' payments to release.');

        foreach ($paymentsToRelease as $payment) {
            try {
                // TODO: Here we would trigger the actual Stripe Connect Transfer:
                // \Stripe\Transfer::create([
                //     'amount' => $payment->amount * 100, // cents
                //     'currency' => $payment->currency,
                //     'destination' => $payment->host->stripe_account_id,
                // ]);
                
                // For now, just mark it as paid out
                $payment->update([
                    'status' => 'paid_out'
                ]);

                Log::info("Escrow funds released for payment ID: {$payment->id}");
                $this->line("Released payout for Payment ID: {$payment->id}");

            } catch (\Exception $e) {
                Log::error("Failed to release escrow for payment ID: {$payment->id}. Error: " . $e->getMessage());
                $this->error("Failed to release payout for Payment ID: {$payment->id}");
            }
        }

        $this->info('Escrow payout processing completed.');
    }
}
