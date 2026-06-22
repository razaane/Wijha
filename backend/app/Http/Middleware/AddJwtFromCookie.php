<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AddJwtFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->hasCookie('wijha_token')) {
            \Illuminate\Support\Facades\Log::info('AddJwtFromCookie: wijha_token cookie IS present!');
            if (!$request->headers->has('Authorization')) {
                $request->headers->set('Authorization', 'Bearer ' . $request->cookie('wijha_token'));
            }
        } else {
            \Illuminate\Support\Facades\Log::info('AddJwtFromCookie: NO wijha_token cookie found.');
        }

        // Force JSON so that exceptions (like Unauthenticated) return JSON instead of HTML
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
