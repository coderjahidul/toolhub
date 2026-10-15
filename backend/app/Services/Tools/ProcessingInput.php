<?php

declare(strict_types=1);

namespace App\Services\Tools;

final class ProcessingInput
{
    /**
     * @param  list<string>  $paths
     * @param  list<string>  $originalNames
     * @param  array<string, mixed>  $options
     */
    public function __construct(
        public readonly array $paths,
        public readonly array $originalNames,
        public readonly array $options = [],
    ) {}
}
