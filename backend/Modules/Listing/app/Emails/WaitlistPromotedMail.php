<?php

namespace Modules\Listing\Emails;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

use Modules\Listing\Models\EventWaitlist;

class WaitlistPromotedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $waitlist;

    /**
     * Create a new message instance.
     */
    public function __construct(EventWaitlist $waitlist)
    {
        $this->waitlist = $waitlist;
    }

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this->subject('A ticket is available for ' . $this->waitlist->listing->title)
                    ->view('emails.waitlist_promoted');
    }
}
