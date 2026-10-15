<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class ConvertImageRequest extends FormRequest
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
            'format' => ['required', 'in:jpg,jpeg,png,webp,gif'],
            'quality' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        $mb = (int) ((int) config('toolhub.image_max_kb') / 1024);

        return [
            'file.required' => 'Choose an image to convert.',
            'format.required' => 'Choose an output format.',
            'file.max' => "Images must be {$mb} MB or smaller.",
        ];
    }
}
