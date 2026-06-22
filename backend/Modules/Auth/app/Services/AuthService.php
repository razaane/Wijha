<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Modules\Auth\Models\RefreshToken;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    /**
     * Generate and send a 6-digit OTP to the user's email.
     */
    public function generateAndSendOtp(string $email, string $name): void
    {
        $otp = (string) random_int(100000, 999999);
        
        Cache::put('otp_register_' . $email, $otp, now()->addMinutes(10));
        
        Mail::to($email)->send(new \Modules\Auth\Emails\OtpMail($otp, $name));
    }

    /**
     * Register a new user.
     *
     * @param array<string, mixed> $data
     * @return array{user: User, access_token: string, refresh_token: string}
     */
    public function register(array $data): array
    {
        $cachedOtp = Cache::get('otp_register_' . $data['email']);
        
        if (!$cachedOtp || $cachedOtp !== $data['otp']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'otp' => ['The verification code is invalid or has expired.'],
            ]);
        }

        Cache::forget('otp_register_' . $data['email']);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // auto-hashed via model cast
            'phone' => $data['phone'] ?? null,
            'locale' => $data['locale'] ?? 'fr',
            'role' => User::ROLE_USER,
        ]);

        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = $this->createRefreshToken($user, $data);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Attempt to authenticate a user and return tokens.
     *
     * @param array<string, mixed> $credentials
     * @param array<string, mixed> $requestData
     * @return array{user: User, access_token: string, refresh_token: string}|null
     */
    public function login(array $credentials, array $requestData = []): ?array
    {
        if (!$accessToken = auth('api')->attempt($credentials)) {
            return null;
        }

        /** @var User $user */
        $user = auth('api')->user();

        $refreshToken = $this->createRefreshToken($user, $requestData);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Logout the user by invalidating current tokens.
     */
    public function logout(): void
    {
        /** @var User $user */
        $user = auth('api')->user();

        // Invalidate the JWT access token (blacklist it)
        auth('api')->logout();

        // Revoke all active refresh tokens for this user
        RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Refresh tokens using a refresh token.
     *
     * @param string $refreshTokenString
     * @param array<string, mixed> $requestData
     * @return array{user: User, access_token: string, refresh_token: string}|null
     */
    public function refresh(string $refreshTokenString, array $requestData = []): ?array
    {
        // Find the refresh token
        $refreshToken = RefreshToken::where('token', hash('sha256', $refreshTokenString))->first();

        if (!$refreshToken || !$refreshToken->isValid()) {
            // If token was already used (revoked), it might be a token theft attempt
            // Revoke ALL tokens for this user as a security measure
            if ($refreshToken && $refreshToken->isRevoked()) {
                RefreshToken::where('user_id', $refreshToken->user_id)
                    ->whereNull('revoked_at')
                    ->update(['revoked_at' => now()]);
            }
            return null;
        }

        // Revoke the old refresh token (rotation)
        $refreshToken->revoke();

        /** @var User $user */
        $user = $refreshToken->user;

        // Generate new access token
        $accessToken = JWTAuth::fromUser($user);

        // Generate new refresh token
        $newRefreshToken = $this->createRefreshToken($user, $requestData);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $newRefreshToken,
        ];
    }

    /**
     * Send a password reset link to the user's email.
     */
    public function sendPasswordResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    /**
     * Reset the user's password.
     *
     * @param array<string, mixed> $data
     */
    public function resetPassword(array $data): string
    {
        return Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke all existing refresh tokens on password reset
                RefreshToken::where('user_id', $user->id)
                    ->whereNull('revoked_at')
                    ->update(['revoked_at' => now()]);
            }
        );
    }

    /**
     * Create a new refresh token for a user.
     *
     * @param User $user
     * @param array<string, mixed> $requestData
     * @return string The plain-text refresh token (only returned once)
     */
    public function createRefreshToken(User $user, array $requestData = []): string
    {
        $plainToken = Str::random(64);

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addMinutes(config('jwt.refresh_ttl')),
            'ip_address' => $requestData['ip'] ?? null,
            'user_agent' => $requestData['user_agent'] ?? null,
        ]);

        return $plainToken;
    }
}
