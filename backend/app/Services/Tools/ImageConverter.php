<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Contracts\ToolProcessor;
use App\Exceptions\ToolProcessingException;
use App\Support\DownloadName;
use Intervention\Image\Exceptions\AnimationException;
use Intervention\Image\ImageManager;

final class ImageConverter implements ToolProcessor
{
    public function __construct(
        private readonly ImageManager $images,
        private readonly ImageEncoder $encoder,
        private readonly TempStore $temp,
    ) {}

    public function slug(): string
    {
        return 'image-converter';
    }

    public function process(ProcessingInput $input): ProcessedFile
    {
        $source = $input->paths[0];
        FileGuard::assertImage($source);
        $format = $this->encoder->normalize((string) ($input->options['format'] ?? ''));
        $quality = (int) ($input->options['quality'] ?? 85);

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

        $destination = $this->temp->make($format);

        try {
            [$mime, $extension] = $this->encoder->save($image, $format, $quality, $destination);
        } catch (\Throwable $exception) {
            $this->temp->discard($destination);
            throw $exception;
        }

        return new ProcessedFile(
            $destination,
            DownloadName::make($input->originalNames[0] ?? 'image', '', $extension),
            $mime,
        );
    }
}
