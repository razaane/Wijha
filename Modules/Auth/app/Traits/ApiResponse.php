<?php

namespace Modules\Auth\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

trait ApiResponse
{
    /**
     * Return a success JSON response.
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'status' => 'success',
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return an error JSON response.
     */
    protected function errorResponse(
        string $error,
        string $message,
        int $statusCode = 400,
        mixed $details = null
    ): JsonResponse {
        $response = [
            'status' => 'error',
            'error' => $error,
            'message' => $message,
            'trace_id' => (string) Str::uuid(),
        ];

        if ($details !== null) {
            $response['details'] = $details;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a token response with access and refresh tokens.
     */
    protected function tokenResponse(string $accessToken, string $refreshToken, mixed $user = null): JsonResponse
    {
        $data = [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60, // seconds
        ];

        if ($user !== null) {
            $data['user'] = $user;
        }

        return $this->successResponse($data, 'Authenticated successfully');
    }
}
