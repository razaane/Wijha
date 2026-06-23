<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    /**
     * Create a new message instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Wijha - Your Email Verification Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "
            <div style='font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 12px;'>
                <h2 style='color: #f59e0b; margin-bottom: 20px;'>Wijha Verification</h2>
                <p style='color: #4b5563; font-size: 16px; margin-bottom: 30px;'>
                    You requested to update your email address. Here is your 6-digit verification code:
                </p>
                <div style='background: #fef3c7; border: 2px dashed #f59e0b; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #b45309; border-radius: 8px; margin-bottom: 30px; display: inline-block;'>
                    {$this->otp}
                </div>
                <p style='color: #9ca3af; font-size: 14px;'>
                    If you didn't request this code, you can safely ignore this email.
                </p>
                <p style='color: #d1d5db; font-size: 12px; margin-top: 40px;'>
                    &copy; " . date('Y') . " Wijha. All rights reserved.
                </p>
            </div>
            ",
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
