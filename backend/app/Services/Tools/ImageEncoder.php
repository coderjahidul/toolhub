<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Exceptions\ToolProcessingException;
use Intervention\Image\Exceptions\AnimationException;
use Intervention\Image\Interfaces\ImageInterface;

final class ImageEncoder
{
    /**
     * @return array{0: string, 1: string} mime and extension
     */
    public function save(ImageInterface $image, string $format, int $quality, string $destination): array
    {
        $format = $this->normalize($format);
        $quality = max(1, min(100, $quality));

        try {
            $encoded = match ($format) {
                'jpg' => $image->toJpeg(quality: $quality, strip: true),
                'png' => $image->toPng(indexed: $quality < 80),
                'webp' => $image->toWebp(quality: $quality, strip: true),
                'gif' => $image->toGif(),
            };
            $encoded->save($destination);
        } catch (AnimationException) {
            throw new ToolProcessingException('Animated images are not supported. Use a single-frame file.');
        } catch (ToolProcessingException $exception) {
            throw $exception;
        } catch (\Throwable) {
            throw new ToolProcessingException('The image could not be encoded.');
        }

        $mime = match ($format) {
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
        };

        return [$mime, $format];
    }

    public function extensionForMime(string $mime): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => throw new ToolProcessingException('Unsupported image type.'),
        };
    }

    public function normalize(string $format): string
    {
        return match (strtolower($format)) {
            'jpg', 'jpeg' => 'jpg',
            'png' => 'png',
            'webp' => 'webp',
            'gif' => 'gif',
            default => throw new ToolProcessingException('Choose jpg, png, webp, or gif.'),
        };
    }
}
