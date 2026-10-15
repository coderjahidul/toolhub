<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompressImageRequest;
use App\Http\Requests\ConvertImageRequest;
use App\Http\Requests\ResizeImageRequest;
use App\Services\ToolResponseFactory;
use App\Services\Tools\ImageCompressor;
use App\Services\Tools\ImageConverter;
use App\Services\Tools\ImageResizer;
use App\Services\Tools\ProcessingInput;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ImageController extends Controller
{
    public function __construct(private readonly ToolResponseFactory $responses) {}

    public function compress(CompressImageRequest $request, ImageCompressor $processor): BinaryFileResponse
    {
        $file = $this->file($request);

        return $this->responses->download(
            $request,
            $processor->slug(),
            (int) $file->getSize(),
            fn () => $processor->process(new ProcessingInput(
                paths: [$file->getPathname()],
                originalNames: [$file->getClientOriginalName()],
                options: ['quality' => (int) $request->input('quality', 75)],
            )),
        );
    }

    public function convert(ConvertImageRequest $request, ImageConverter $processor): BinaryFileResponse
    {
        $file = $this->file($request);

        return $this->responses->download(
            $request,
            $processor->slug(),
            (int) $file->getSize(),
            fn () => $processor->process(new ProcessingInput(
                paths: [$file->getPathname()],
                originalNames: [$file->getClientOriginalName()],
                options: [
                    'format' => (string) $request->input('format'),
                    'quality' => (int) $request->input('quality', 85),
                ],
            )),
        );
    }

    public function resize(ResizeImageRequest $request, ImageResizer $processor): BinaryFileResponse
    {
        $file = $this->file($request);

        return $this->responses->download(
            $request,
            $processor->slug(),
            (int) $file->getSize(),
            fn () => $processor->process(new ProcessingInput(
                paths: [$file->getPathname()],
                originalNames: [$file->getClientOriginalName()],
                options: [
                    'width' => $request->filled('width') ? (int) $request->input('width') : null,
                    'height' => $request->filled('height') ? (int) $request->input('height') : null,
                    'percent' => $request->filled('percent') ? (int) $request->input('percent') : null,
                    'maintain_aspect' => $request->boolean('maintain_aspect', true),
                ],
            )),
        );
    }

    private function file(CompressImageRequest|ConvertImageRequest|ResizeImageRequest $request): UploadedFile
    {
        $file = $request->file('file');

        if (! $file instanceof UploadedFile) {
            abort(422, 'Choose an image file.');
        }

        return $file;
    }
}
