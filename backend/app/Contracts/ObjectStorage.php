<?php

declare(strict_types=1);

namespace App\Contracts;

use DateTimeInterface;

/**
 * Storage port for a later saved-files phase.
 * The MVP processes files on local temp disk and does not persist uploads.
 */
interface ObjectStorage
{
    public function put(string $path, string $contents): void;

    public function get(string $path): ?string;

    public function delete(string $path): void;

    public function temporaryUrl(string $path, DateTimeInterface $expires): string;
}
