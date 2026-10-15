<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\ToolProcessingException;
use App\Models\User;
use App\Services\Tools\ProcessedFile;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class ToolResponseFactory
{
    public function __construct(
        private readonly UsageLimiter $usage,
        private readonly SavedFileStore $files,
    ) {}

    public function download(Request $request, string $slug, int $bytes, callable $callback): BinaryFileResponse
    {
        $this->usage->assertAllowed($request);
        set_time_limit((int) config('toolhub.timeout_seconds', 60));

        try {
            /** @var ProcessedFile $file */
            $file = $callback();
        } catch (ToolProcessingException $exception) {
            $this->usage->record($request, $slug, $bytes, 'failed');
            throw $exception;
        } catch (Throwable $exception) {
            $this->usage->record($request, $slug, $bytes, 'failed');
            report($exception);
            throw new ToolProcessingException('The file could not be processed.');
        }

        $remaining = $this->usage->record($request, $slug, $bytes, 'success');
        $user = $request->user();
        if ($user instanceof User) {
            $this->files->store($user, $slug, $file);
        }

        return response()->download($file->path, $file->filename, [
            'Content-Type' => $file->mime,
            'X-Daily-Limit' => (string) config('toolhub.daily_limit'),
            'X-Daily-Remaining' => (string) $remaining,
        ])->deleteFileAfterSend(true);
    }
}
