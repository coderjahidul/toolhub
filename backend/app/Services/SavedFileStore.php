<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ObjectStorage;
use App\Models\StoredFile;
use App\Models\User;
use App\Services\Tools\ProcessedFile;
use Illuminate\Support\Str;
use Throwable;

class SavedFileStore
{
    public function __construct(private readonly ObjectStorage $storage) {}

    public function store(User $user, string $slug, ProcessedFile $file): ?StoredFile
    {
        try {
            $contents = file_get_contents($file->path);
            if ($contents === false) {
                return null;
            }

            $path = 'saved/'.$user->id.'/'.Str::uuid()->toString().'-'.$file->filename;
            $this->storage->put($path, $contents);

            return StoredFile::query()->create([
                'user_id' => $user->id,
                'tool_slug' => $slug,
                'filename' => $file->filename,
                'path' => $path,
                'mime' => $file->mime,
                'bytes' => strlen($contents),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }
}
