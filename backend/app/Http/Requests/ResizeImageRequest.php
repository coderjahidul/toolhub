<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class ResizeImageRequest extends FormRequest
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
            'width' => ['nullable', 'integer', 'min:1', 'max:8000'],
            'height' => ['nullable', 'integer', 'min:1', 'max:8000'],
            'percent' => ['nullable', 'integer', 'min:1', 'max:100'],
            'maintain_aspect' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->filled('percent') && ! $this->filled('width') && ! $this->filled('height')) {
                $validator->errors()->add('width', 'Set a width, height, or percent.');
            }
        });
    }

    public function messages(): array
    {
        $mb = (int) ((int) config('toolhub.image_max_kb') / 1024);

        return [
            'file.required' => 'Choose an image to resize.',
            'file.max' => "Images must be {$mb} MB or smaller.",
        ];
    }
}
