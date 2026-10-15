<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Contracts\ToolProcessor;
use App\Exceptions\ToolProcessingException;
use App\Support\DownloadName;
use Intervention\Image\Exceptions\AnimationException;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

final class ImageCompressor implements ToolProcessor
{
    public function __construct(
        private readonly ImageManager $images,
        private readonly ImageEncoder $encoder,
        private readonly TempStore $temp,
    ) {}

    public function slug(): string
    {
        return 'image-compressor';
    }

    public function process(ProcessingInput $input): ProcessedFile
    {
        $source = $input->paths[0];
        $mime = FileGuard::assertImage($source);
        $format = $this->encoder->extensionForMime($mime);
        $quality = (int) ($input->options['quality'] ?? 75);
        $image = $this->read($source);
        $destination = $this->temp->make($format);

        try {
            [$outMime, $extension] = $this->encoder->save($image, $format, $quality, $destination);
        } catch (\Throwable $exception) {
            $this->temp->discard($destination);
            throw $exception;
        }

        return new ProcessedFile(
            $destination,
            DownloadName::make($input->originalNames[0] ?? 'image', 'compressed', $extension),
            $outMime,
        );
    }

    private function read(string $path): ImageInterface
    {
        try {
            $image = $this->images->read($path);
        } catch (AnimationException) {
            throw new ToolProcessingException('Animated images are not supported. Use a single-frame file.');
        } catch (\Throwable) {
            throw new ToolProcessingException('The image could not be read.');
        }

        $max = (int) config('toolhub.max_edge_px', 10000);

        if ($image->width() > $max || $image->height() > $max) {
            throw new ToolProcessingException("Images must be {$max} pixels or smaller on each side.");
        }

        return $image;
    }
}
