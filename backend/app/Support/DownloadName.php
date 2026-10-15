<?php

declare(strict_types=1);

namespace App\Support;

final class DownloadName
{
    public static function make(string $original, string $suffix, string $extension): string
    {
        $original = str_replace(["\0", '"', "\r", "\n"], '', $original);
        $base = pathinfo(str_replace('\\', '/', $original), PATHINFO_FILENAME);
        $base = preg_replace('/[^A-Za-z0-9_-]+/', '-', $base) ?? '';
        $base = trim($base, '-_.');

        if ($base === '') {
            $base = 'file';
        }

        $base = substr($base, 0, 80);
        $extension = strtolower(preg_replace('/[^a-z0-9]+/', '', strtolower($extension)) ?? '');

        if ($extension === '') {
            $extension = 'bin';
        }

        $suffix = preg_replace('/[^A-Za-z0-9_-]+/', '-', $suffix) ?? '';
        $suffix = trim($suffix, '-');

        if ($suffix === '') {
            return $base.'.'.$extension;
        }

        return $base.'-'.$suffix.'.'.$extension;
    }
}
