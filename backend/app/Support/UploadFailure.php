<?php

declare(strict_types=1);

namespace App\Support;

final class UploadFailure
{
    public static function message(int $error): string
    {
        $limit = ini_get('upload_max_filesize') ?: '2M';

        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => "This file is larger than the server upload limit ({$limit}). Choose a smaller file.",
            UPLOAD_ERR_PARTIAL => 'The upload was interrupted. Try again.',
            UPLOAD_ERR_NO_FILE => 'Choose a file to upload.',
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE, UPLOAD_ERR_EXTENSION => 'The server could not store the upload. Try again.',
            default => 'The file failed to upload.',
        };
    }
}
