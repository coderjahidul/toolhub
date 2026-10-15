<?php

use App\Exceptions\DailyLimitExceededException;
use App\Exceptions\ToolProcessingException;
use App\Http\Middleware\RejectInvalidUploads;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Nginx on the VPS is the only trusted proxy. It overwrites X-Forwarded-For.
        $middleware->trustProxies(at: '127.0.0.1');
        $middleware->prependToGroup('api', RejectInvalidUploads::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (DailyLimitExceededException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'limit' => $exception->limit,
                ], 429);
            }
        });

        $exceptions->render(function (PostTooLargeException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $limit = ini_get('post_max_size') ?: '8M';

                return response()->json([
                    'message' => "This upload is larger than the server request limit ({$limit}).",
                ], 413);
            }
        });

        $exceptions->render(function (ToolProcessingException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => $exception->getMessage(),
                ], 422);
            }
        });
    })->create();
