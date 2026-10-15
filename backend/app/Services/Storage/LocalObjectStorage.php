<?php

declare(strict_types=1);

namespace App\Services\Storage;

use App\Contracts\ObjectStorage;
use DateTimeInterface;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;

final class LocalObjectStorage implements ObjectStorage
{
    public function put(string $path, string $contents): void
    {
        Storage::disk('local')->put($this->key($path), $contents);
    }

    public function get(string $path): ?string
    {
        $disk = Storage::disk('local');
        $key = $this->key($path);

        if (! $disk->exists($key)) {
            return null;
        }

        return $disk->get($key);
    }

    public function delete(string $path): void
    {
        Storage::disk('local')->delete($this->key($path));
    }

    public function temporaryUrl(string $path, DateTimeInterface $expires): string
    {
        throw new RuntimeException('Temporary URLs require the Cloudflare R2 disk.');
    }

    private function key(string $path): string
    {
        return $this->safeKey($path);
    }

    public static function safeKey(string $path): string
    {
        $path = str_replace('\\', '/', $path);
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..') || str_contains($path, "\0")) {
            throw new InvalidArgumentException('Storage path was rejected.');
        }

        return $path;
    }
}
