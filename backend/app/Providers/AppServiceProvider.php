<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Auth\Notifications\ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $frontendUrl = config('services.frontend.url', env('FRONTEND_URL', 'http://localhost:3000'));
            $url = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

            return (new \Illuminate\Notifications\Messages\MailMessage)
                ->subject('Reset Your Wijha Password 🌍')
                ->greeting('Hello Explorer!')
                ->line('You are receiving this email because we received a password reset request for your Wijha account.')
                ->action('Reset Password', $url)
                ->line('If you did not request a password reset, no further action is required.')
                ->line('Safe travels!')
                ->salutation('The Wijha Team');
        });
    }
}
