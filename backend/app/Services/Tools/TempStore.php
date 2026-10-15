<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Exceptions\ToolProcessingException;
use Illuminate\Support\Str;

final class TempStore
{
    public function make(string $extension): string
    {
        $directory = storage_path('app/tmp');

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new ToolProcessingException('Temporary storage is unavailable.');
        }

        $extension = strtolower(preg_replace('/[^a-z0-9]+/', '', strtolower($extension)) ?? '');

        if ($extension === '') {
            $extension = 'bin';
        }

        return $directory.'/'.Str::uuid()->toString().'.'.$extension;
    }

    public function discard(?string $path): void
    {
        if ($path !== null && is_file($path)) {
            unlink($path);
        }
    }
}
