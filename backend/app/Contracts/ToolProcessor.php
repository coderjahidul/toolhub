<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Services\Tools\ProcessedFile;
use App\Services\Tools\ProcessingInput;

interface ToolProcessor
{
    public function slug(): string;

    public function process(ProcessingInput $input): ProcessedFile;
}
