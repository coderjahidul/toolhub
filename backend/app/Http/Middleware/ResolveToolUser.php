<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\ApiKeyIssuer;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResolveToolUser
{
    public function __construct(private readonly ApiKeyIssuer $keys) {}

    public function handle(Request $request, Closure $next): Response
    {
        $plain = $request->bearerToken();

        if (is_string($plain) && str_starts_with($plain, 'thub_')) {
            $key = $this->keys->findByPlain($plain);
            if ($key === null) {
                return response()->json(['message' => 'Invalid API key.'], 401);
            }

            $key->forceFill(['last_used_at' => now()])->save();
            $request->attributes->set('via_api_key', true);
            $request->setUserResolver(fn () => $key->user);

            return $next($request);
        }

        if (is_string($plain) && $plain !== '') {
            $user = Auth::guard('sanctum')->user();
            if ($user !== null) {
                $request->setUserResolver(fn () => $user);
            }
        }

        return $next($request);
    }
}
