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
use Modules\Auth\Services\AuthService;
use Modules\Auth\Traits\ApiResponse;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService,
    ) {}

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
                'The provided credentials are incorrect.',
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

        return $this->successResponse(
            message: 'Successfully logged out.'
        );
    }

    /**
     * Refresh the access token using a refresh token.
     *
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $result = $this->authService->refresh(
            $request->input('refresh_token'),
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

        // Always return success to prevent email enumeration
        return $this->successResponse(
            message: 'If an account exists with that email, a password reset link has been sent.'
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
