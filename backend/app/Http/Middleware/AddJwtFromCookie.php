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
        if ($request->hasCookie('wijha_token') && !$request->headers->has('Authorization')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('wijha_token'));
        }

        return $next($request);
    }
}
