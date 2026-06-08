<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Modules\Auth\Services\AuthService;
use Exception;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user already exists
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Create a new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(Str::random(24)), // Random password
                    'role' => User::ROLE_USER,
                    'provider_name' => 'google',
                    'provider_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Update provider info if not set
                if (!$user->provider_name) {
                    $user->update([
                        'provider_name' => 'google',
                        'provider_id' => $googleUser->getId(),
                    ]);
                }
            }

            // Generate JWT Token
            $token = auth()->guard('api')->login($user);

            if (!$token) {
                throw new Exception("Failed to generate token");
            }

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token);

        } catch (Exception $e) {
            // Log the error
            \Log::error('Google Auth Error: ' . $e->getMessage());
            
            // Redirect back to frontend login with error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect()->away($frontendUrl . '/login?error=auth_failed');
        }
    }
}
