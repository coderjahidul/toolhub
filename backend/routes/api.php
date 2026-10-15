<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\ImageController;
use App\Http\Controllers\Api\V1\PdfController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Middleware\ResolveToolUser;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/auth/config', [AuthController::class, 'config']);
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::get('/blog', [BlogController::class, 'index']);
    Route::get('/blog/{slug}', [BlogController::class, 'show'])->where('slug', '[a-z0-9\-]+');

    Route::middleware([ResolveToolUser::class, 'throttle:30,1'])->group(function () {
        Route::post('/image/compress', [ImageController::class, 'compress']);
        Route::post('/image/convert', [ImageController::class, 'convert']);
        Route::post('/image/resize', [ImageController::class, 'resize']);
        Route::post('/pdf/merge', [PdfController::class, 'merge']);
        Route::post('/pdf/compress', [PdfController::class, 'compress']);

        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/account/usage', [AccountController::class, 'usage']);
        Route::get('/account/files', [AccountController::class, 'files']);
        Route::get('/account/files/{file}', [AccountController::class, 'download']);
        Route::delete('/account/files/{file}', [AccountController::class, 'destroyFile']);
        Route::get('/account/api-keys', [AccountController::class, 'keys']);
        Route::post('/account/api-keys', [AccountController::class, 'storeKey']);
        Route::delete('/account/api-keys/{apiKey}', [AccountController::class, 'destroyKey']);

        Route::get('/admin/overview', [SettingsController::class, 'overview']);
        Route::get('/admin/users', [SettingsController::class, 'users']);
        Route::put('/admin/settings', [SettingsController::class, 'update']);
        Route::get('/admin/guides', [BlogController::class, 'adminIndex']);
        Route::post('/admin/guides', [BlogController::class, 'store']);
        Route::get('/admin/guides/{blog}', [BlogController::class, 'adminShow']);
        Route::put('/admin/guides/{blog}', [BlogController::class, 'update']);
        Route::delete('/admin/guides/{blog}', [BlogController::class, 'destroy']);
    });
});
