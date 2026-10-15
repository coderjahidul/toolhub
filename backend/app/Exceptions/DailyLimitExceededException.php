<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class DailyLimitExceededException extends RuntimeException
{
    public function __construct(public readonly int $limit)
    {
        parent::__construct("Daily free limit reached ({$limit} operations).");
    }
}
