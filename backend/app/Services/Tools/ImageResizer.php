<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Contracts\ToolProcessor;
use App\Exceptions\ToolProcessingException;
use App\Support\DownloadName;
use Intervention\Image\Exceptions\AnimationException;
use Intervention\Image\ImageManager;

final class ImageResizer implements ToolProcessor
{
    public function __construct(
        private readonly ImageManager $images,
        private readonly ImageEncoder $encoder,
        private readonly TempStore $temp,
    ) {}

    public function slug(): string
    {
        return 'image-resizer';
    }

    public function process(ProcessingInput $input): ProcessedFile
    {
        $source = $input->paths[0];
        $mime = FileGuard::assertImage($source);
        $format = $this->encoder->extensionForMime($mime);

        try {
            $image = $this->images->read($source);
        } catch (AnimationException) {
            throw new ToolProcessingException('Animated images are not supported. Use a single-frame file.');
        } catch (\Throwable) {
            throw new ToolProcessingException('The image could not be read.');
        }

        $max = (int) config('toolhub.max_edge_px', 10000);

        if ($image->width() > $max || $image->height() > $max) {
            throw new ToolProcessingException("Images must be {$max} pixels or smaller on each side.");
        }

        $this->resize($image, $input->options);
        $destination = $this->temp->make($format);

        try {
            [$outMime, $extension] = $this->encoder->save($image, $format, 90, $destination);
        } catch (\Throwable $exception) {
            $this->temp->discard($destination);
            throw $exception;
        }

        return new ProcessedFile(
            $destination,
            DownloadName::make($input->originalNames[0] ?? 'image', 'resized', $extension),
            $outMime,
        );
    }

    /**
     * @param  array<string, mixed>  $options
     */
    private function resize(\Intervention\Image\Interfaces\ImageInterface $image, array $options): void
    {
        $percent = $options['percent'] ?? null;
        $width = $options['width'] ?? null;
        $height = $options['height'] ?? null;
        $maintainAspect = (bool) ($options['maintain_aspect'] ?? true);

        if ($percent !== null) {
            $ratio = max(1, min(100, (int) $percent)) / 100;
            $image->scale(
                width: max(1, (int) round($image->width() * $ratio)),
                height: max(1, (int) round($image->height() * $ratio)),
            );

            return;
        }

        $width = $width !== null ? (int) $width : null;
        $height = $height !== null ? (int) $height : null;

        if ($width === null && $height === null) {
            throw new ToolProcessingException('Set a width, height, or percent.');
        }

        if ($maintainAspect || $width === null || $height === null) {
            $image->scale(width: $width, height: $height);

            return;
        }

        $image->resize($width, $height);
    }
}
