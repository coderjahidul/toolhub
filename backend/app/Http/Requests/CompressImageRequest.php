<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class CompressImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp', 'gif'])->max((int) config('toolhub.image_max_kb')),
            ],
            'quality' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        $mb = (int) ((int) config('toolhub.image_max_kb') / 1024);

        return [
            'file.required' => 'Choose an image to compress.',
            'file.max' => "Images must be {$mb} MB or smaller.",
        ];
    }
}
