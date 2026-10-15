<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class CompressPdfRequest extends FormRequest
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
                File::types(['pdf'])->max((int) config('toolhub.pdf_max_kb')),
            ],
            'level' => ['sometimes', 'in:screen,ebook,printer'],
        ];
    }

    public function messages(): array
    {
        $mb = (int) ((int) config('toolhub.pdf_max_kb') / 1024);

        return [
            'file.required' => 'Choose a PDF to compress.',
            'file.max' => "PDFs must be {$mb} MB or smaller.",
        ];
    }
}
