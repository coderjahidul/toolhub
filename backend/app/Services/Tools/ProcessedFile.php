<?php

declare(strict_types=1);

namespace App\Services\Tools;

final class ProcessedFile
{
    public function __construct(
        public readonly string $path,
        public readonly string $filename,
        public readonly string $mime,
    ) {}
}
