<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class MergePdfRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxKb = (int) config('toolhub.pdf_max_kb');
        $maxFiles = (int) config('toolhub.pdf_max_files');

        return [
            'files' => ['required', 'array', 'min:2', 'max:'.$maxFiles],
            'files.*' => ['required', File::types(['pdf'])->max($maxKb)],
        ];
    }

    public function messages(): array
    {
        $mb = (int) ((int) config('toolhub.pdf_max_kb') / 1024);
        $maxFiles = (int) config('toolhub.pdf_max_files');

        return [
            'files.required' => 'Choose at least two PDF files.',
            'files.min' => 'Choose at least two PDF files.',
            'files.max' => "You can merge up to {$maxFiles} PDF files.",
            'files.*.max' => "Each PDF must be {$mb} MB or smaller.",
        ];
    }
}
