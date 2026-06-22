<?php

namespace Modules\Payment\Observers;

use Modules\Payment\Models\Dispute;
use Modules\Payment\Models\Payment;

class DisputeObserver
{
    /**
     * Handle the Dispute "created" event.
     */
    public function created(Dispute $dispute): void
    {
        // Find the related payment for this booking
        $payment = Payment::where('booking_id', $dispute->booking_id)->first();

        // If a payment exists and is held in escrow, freeze it immediately
        if ($payment && $payment->status === 'held_in_escrow') {
            $payment->update([
                'status' => 'disputed'
            ]);
            
            // TODO: In the future, send an email to the host notifying them of the freeze.
        }
    }

    /**
     * Handle the Dispute "updated" event.
     */
    public function updated(Dispute $dispute): void
    {
        // If dispute is resolved in favor of host, release funds (held_in_escrow)
        // If dispute is resolved in favor of guest, refund funds (refunded)
        if ($dispute->isDirty('status')) {
            $payment = Payment::where('booking_id', $dispute->booking_id)->first();
            if ($payment) {
                if ($dispute->status === 'resolved_host') {
                    // Host wins, return to escrow to be paid out
                    $payment->update(['status' => 'held_in_escrow']);
                } elseif ($dispute->status === 'resolved_guest') {
                    // Guest wins, mark as refunded (Stripe logic would go here)
                    $payment->update(['status' => 'refunded']);
                }
            }
        }
    }
}
