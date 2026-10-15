<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AccountProvisioner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

class GoogleController extends Controller
{
    public function __construct(private readonly AccountProvisioner $accounts) {}

    public function redirect(): SymfonyRedirect|RedirectResponse
    {
        if (! $this->configured()) {
            return redirect($this->frontend('/login?google=unconfigured'));
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->configured()) {
            return redirect($this->frontend('/login?google=unconfigured'));
        }

        try {
            $google = Socialite::driver('google')->stateless()->user();
        } catch (Throwable) {
            return redirect($this->frontend('/login?google=failed'));
        }

        $email = $google->getEmail();
        if (! is_string($email) || $email === '') {
            return redirect($this->frontend('/login?google=failed'));
        }

        $user = User::query()->where('google_id', $google->getId())->first()
            ?? User::query()->where('email', $email)->first();

        if ($user === null) {
            $user = new User;
            $user->name = $google->getName() ?: Str::before($email, '@');
            $user->email = $email;
            $user->password = null;
            $user->email_verified_at = now();
        }

        $user->google_id = (string) $google->getId();
        $user->avatar = $google->getAvatar();
        $user->save();
        $this->accounts->ensureFreePlan($user);

        $token = $user->createToken('google')->plainTextToken;

        return redirect($this->frontend('/auth/callback?token='.urlencode($token)));
    }

    private function configured(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));
    }

    private function frontend(string $path): string
    {
        $origins = array_values(array_filter(array_map(
            trim(...),
            explode(',', (string) config('toolhub.frontend_url', 'http://localhost:3000'))
        )));
        $base = $origins[0] ?? 'http://localhost:3000';

        return rtrim($base, '/').$path;
    }
}
