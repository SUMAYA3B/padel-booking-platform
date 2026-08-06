<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request, allowing only admin users.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'غير مصرح لك بالوصول إلى لوحة التحكم.'], 403);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'تم تعطيل هذا الحساب.'], 403);
        }

        return $next($request);
    }
}
