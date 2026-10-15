<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Support\Str;

class ApiKeyIssuer
{
    public function issue(User $user, string $name): array
    {
        $plain = 'thub_'.Str::random(40);

        $key = ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'prefix' => substr($plain, 0, 12),
            'key_hash' => hash('sha256', $plain),
        ]);

        return ['key' => $key, 'plain' => $plain];
    }

    public function findByPlain(string $plain): ?ApiKey
    {
        if (! str_starts_with($plain, 'thub_')) {
            return null;
        }

        return ApiKey::query()->where('key_hash', hash('sha256', $plain))->first();
    }
}
