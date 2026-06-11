<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Modules\Auth\Services\AuthService;
use Modules\Core\Traits\ApiResponse;
use Exception;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;

class SocialAuthController extends Controller
{
    use ApiResponse;

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
     * Sets JWT via HttpOnly cookie (consistent with the rest of the auth system)
     * instead of passing the token in the URL query string.
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

            // Generate refresh token
            $refreshToken = $this->authService->createRefreshToken($user);

            // Build redirect with HttpOnly cookies (matching the tokenResponse pattern)
            $frontendUrl = config('services.frontend.url', 'http://localhost:3000');
            
            $ttlMinutes = config('jwt.ttl');
            $refreshTtlMinutes = config('jwt.refresh_ttl');
            $secure = app()->environment('production');

            return redirect()->away($frontendUrl . '/auth/callback')
                ->cookie('wijha_token', $token, $ttlMinutes, '/', null, $secure, true, false, 'Lax')
                ->cookie('wijha_refresh_token', $refreshToken, $refreshTtlMinutes, '/', null, $secure, true, false, 'Lax')
                ->cookie('is_logged_in', '1', $refreshTtlMinutes, '/', null, $secure, false, false, 'Lax');

        } catch (Exception $e) {
            Log::error('Google Auth Error: ' . $e->getMessage());
            
            // Redirect back to frontend login with error
            $frontendUrl = config('services.frontend.url', 'http://localhost:3000');
            return redirect()->away($frontendUrl . '/login?error=auth_failed');
        }
    }
}
