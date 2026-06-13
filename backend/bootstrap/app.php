<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Ensure API requests always get JSON responses and process JWT from cookies
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\AddJwtFromCookie::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Handle Laravel AuthenticationException for APIs (prevents redirect to 'login' route)
        $exceptions->renderable(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                ], 401)->withoutCookie('wijha_token')->withoutCookie('is_logged_in');
            }
        });

        // Handle JWT Token Expired
        $exceptions->renderable(function (TokenExpiredException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'TOKEN_EXPIRED',
                    'message' => 'Your session has expired. Please refresh your token.',
                    'trace_id' => (string) Str::uuid(),
                ], 401)->withoutCookie('wijha_token')->withoutCookie('is_logged_in');
            }
        });

        // Handle JWT Token Invalid
        $exceptions->renderable(function (TokenInvalidException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'TOKEN_INVALID',
                    'message' => 'The provided token is invalid.',
                    'trace_id' => (string) Str::uuid(),
                ], 401)->withoutCookie('wijha_token')->withoutCookie('is_logged_in');
            }
        });

        // Handle JWT general exceptions
        $exceptions->renderable(function (JWTException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'TOKEN_ABSENT',
                    'message' => 'Authorization token not provided.',
                    'trace_id' => (string) Str::uuid(),
                ], 401)->withoutCookie('wijha_token')->withoutCookie('is_logged_in');
            }
        });

        // Handle 404 for API routes
        $exceptions->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'NOT_FOUND',
                    'message' => 'The requested resource was not found.',
                    'trace_id' => (string) Str::uuid(),
                ], 404);
            }
        });

        // Handle rate limiting
        $exceptions->renderable(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'TOO_MANY_REQUESTS',
                    'message' => 'Too many requests. Please try again later.',
                    'trace_id' => (string) Str::uuid(),
                ], 429);
            }
        });

    })->create();

