<?php

declare(strict_types=1);

namespace App\Services\Storage;

use App\Contracts\ObjectStorage;
use DateTimeInterface;
use Illuminate\Support\Facades\Storage;

final class R2ObjectStorage implements ObjectStorage
{
    public function put(string $path, string $contents): void
    {
        Storage::disk('r2')->put(LocalObjectStorage::safeKey($path), $contents);
    }

    public function get(string $path): ?string
    {
        $disk = Storage::disk('r2');
        $key = LocalObjectStorage::safeKey($path);

        if (! $disk->exists($key)) {
            return null;
        }

        return $disk->get($key);
    }

    public function delete(string $path): void
    {
        Storage::disk('r2')->delete(LocalObjectStorage::safeKey($path));
    }

    public function temporaryUrl(string $path, DateTimeInterface $expires): string
    {
        return Storage::disk('r2')->temporaryUrl(LocalObjectStorage::safeKey($path), $expires);
    }
}
