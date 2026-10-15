<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\UploadFailure;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class RejectInvalidUploads
{
    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->files($request->allFiles()) as $file) {
            if ($file->isValid() || $file->getError() === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            return response()->json([
                'message' => UploadFailure::message($file->getError()),
            ], 422);
        }

        return $next($request);
    }

    /**
     * @param  array<int|string, mixed>  $files
     * @return list<UploadedFile>
     */
    private function files(array $files): array
    {
        $flat = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $flat[] = $file;
                continue;
            }

            if (is_array($file)) {
                array_push($flat, ...$this->files($file));
            }
        }

        return $flat;
    }
}
