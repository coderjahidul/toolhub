<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PruneTempFiles extends Command
{
    protected $signature = 'toolhub:prune-temp {--minutes=60 : Delete temp files older than this many minutes}';

    protected $description = 'Delete leftover tool processing files from local temp storage';

    public function handle(): int
    {
        $directory = storage_path('app/tmp');

        if (! is_dir($directory)) {
            $this->info('Temp directory does not exist.');

            return self::SUCCESS;
        }

        $cutoff = now()->subMinutes(max(1, (int) $this->option('minutes')))->getTimestamp();
        $removed = 0;

        foreach (File::files($directory) as $file) {
            if ($file->getMTime() <= $cutoff) {
                File::delete($file->getPathname());
                $removed++;
            }
        }

        $this->info("Removed {$removed} temp file(s).");

        return self::SUCCESS;
    }
}
