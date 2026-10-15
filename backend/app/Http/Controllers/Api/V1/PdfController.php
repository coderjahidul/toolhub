<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompressPdfRequest;
use App\Http\Requests\MergePdfRequest;
use App\Services\ToolResponseFactory;
use App\Services\Tools\PdfCompressor;
use App\Services\Tools\PdfMerger;
use App\Services\Tools\ProcessingInput;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PdfController extends Controller
{
    public function __construct(private readonly ToolResponseFactory $responses) {}

    public function merge(MergePdfRequest $request, PdfMerger $processor): BinaryFileResponse
    {
        /** @var array<int, UploadedFile> $files */
        $files = $request->file('files', []);
        $paths = [];
        $names = [];
        $bytes = 0;

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $paths[] = $file->getPathname();
            $names[] = $file->getClientOriginalName();
            $bytes += (int) $file->getSize();
        }

        return $this->responses->download(
            $request,
            $processor->slug(),
            $bytes,
            fn () => $processor->process(new ProcessingInput(
                paths: $paths,
                originalNames: $names,
            )),
        );
    }

    public function compress(CompressPdfRequest $request, PdfCompressor $processor): BinaryFileResponse
    {
        $file = $request->file('file');

        if (! $file instanceof UploadedFile) {
            abort(422, 'Choose a PDF file.');
        }

        return $this->responses->download(
            $request,
            $processor->slug(),
            (int) $file->getSize(),
            fn () => $processor->process(new ProcessingInput(
                paths: [$file->getPathname()],
                originalNames: [$file->getClientOriginalName()],
                options: ['level' => (string) $request->input('level', 'ebook')],
            )),
        );
    }
}
