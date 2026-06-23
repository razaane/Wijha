<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Modules\Auth\Http\Requests\ForgotPasswordRequest;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Http\Requests\RegisterRequest;
use Modules\Auth\Http\Requests\ResetPasswordRequest;
use Modules\Auth\Http\Requests\SendOtpRequest;
use Modules\Auth\Services\AuthService;
use Modules\Core\Traits\ApiResponse;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService,
    ) {}

    /**
     * Generate and send an OTP for registration.
     *
     * POST /api/v1/auth/register/send-otp
     */
    public function sendOtp(SendOtpRequest $request): JsonResponse
    {
        $this->authService->generateAndSendOtp(
            $request->input('email'),
            $request->input('name')
        );

        return $this->successResponse(
            message: 'Verification code sent to your email.'
        );
    }

    /**
     * Register a new user.
     *
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(
            array_merge(
                $request->validated(),
                [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            )
        );

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            $result['user']
        );
    }

    /**
     * Authenticate a user and return tokens.
     *
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->only(['email', 'password']),
            [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        );

        if (!$result) {
            return $this->errorResponse(
                'INVALID_CREDENTIALS',
                'The email or password you entered is incorrect. Please double-check and try again.',
                401
            );
        }

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            $result['user']
        );
    }

    /**
     * Logout the authenticated user.
     *
     * POST /api/v1/auth/logout
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        $response = $this->successResponse(
            message: 'Successfully logged out.'
        );

        return $response->withoutCookie('wijha_token')
                        ->withoutCookie('wijha_refresh_token')
                        ->withoutCookie('is_logged_in');
    }

    /**
     * Refresh the access token using a refresh token.
     *
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->cookie('wijha_refresh_token');

        if (!$refreshToken) {
            return $this->errorResponse(
                'TOKEN_ABSENT',
                'Refresh token is required.',
                400
            );
        }

        $result = $this->authService->refresh(
            $refreshToken,
            [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        );

        if (!$result) {
            return $this->errorResponse(
                'INVALID_REFRESH_TOKEN',
                'The refresh token is invalid, expired, or has been revoked.',
                401
            );
        }

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            $result['user']
        );
    }

    /**
     * Get the authenticated user's profile.
     *
     * GET /api/v1/auth/me
     */
    public function me(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        return $this->successResponse($user, 'User profile retrieved.');
    }

    /**
     * Send a password reset link.
     *
     * POST /api/v1/auth/forgot-password
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->sendPasswordResetLink($request->input('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->successResponse(
                message: 'A password reset link has been sent to your email address.'
            );
        }

        return $this->errorResponse(
            'USER_NOT_FOUND',
            'No account exists with this email address.',
            404
        );
    }

    /**
     * Reset the user's password.
     *
     * POST /api/v1/auth/reset-password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->resetPassword($request->validated());

        if ($status === Password::PASSWORD_RESET) {
            return $this->successResponse(
                message: 'Password has been reset successfully.'
            );
        }

        return $this->errorResponse(
            'RESET_FAILED',
            'Unable to reset password. The token may be invalid or expired.',
            422
        );
    }
}
