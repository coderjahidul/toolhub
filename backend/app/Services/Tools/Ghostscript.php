<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Exceptions\ToolProcessingException;
use Symfony\Component\Process\Process;

final class Ghostscript
{
    /**
     * @param  list<string>  $inputs
     * @param  list<string>  $flags
     */
    public function writePdf(string $output, array $inputs, array $flags): void
    {
        $this->assertTempPath($output);

        foreach ($inputs as $input) {
            $this->assertTempPath($input);

            if (! is_file($input)) {
                throw new ToolProcessingException('A PDF could not be read.');
            }
        }

        if (is_file($output)) {
            unlink($output);
        }

        $command = array_merge(
            [(string) config('toolhub.ghostscript_binary', 'gs')],
            $flags,
            ['-sOutputFile='.$output],
            $inputs,
        );

        $process = new Process($command);
        $process->setTimeout((int) config('toolhub.timeout_seconds', 60));
        $process->run();

        if (! $process->isSuccessful() || ! is_file($output) || filesize($output) === 0) {
            if (is_file($output)) {
                unlink($output);
            }

            throw new ToolProcessingException('PDF processing failed.');
        }
    }

    private function assertTempPath(string $path): void
    {
        $root = rtrim(str_replace('\\', '/', storage_path('app/tmp')), '/').'/';
        $normalized = str_replace('\\', '/', $path);

        if (! str_starts_with($normalized, $root) || ! preg_match('#^[A-Za-z0-9_./-]+$#', $normalized)) {
            throw new ToolProcessingException('Temporary path was rejected.');
        }
    }
}
