<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Exceptions\ToolProcessingException;

final class FileGuard
{
    public static function assertImage(string $path): string
    {
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path);
        $allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ];

        if (! in_array($mime, $allowed, true)) {
            throw new ToolProcessingException('Upload a JPG, PNG, WebP, or GIF image.');
        }

        return $mime;
    }

    public static function assertPdf(string $path): void
    {
        $handle = fopen($path, 'rb');
        $header = $handle ? fread($handle, 5) : false;

        if (is_resource($handle)) {
            fclose($handle);
        }

        if ($header !== '%PDF-') {
            throw new ToolProcessingException('Upload a valid PDF file.');
        }
    }
}
