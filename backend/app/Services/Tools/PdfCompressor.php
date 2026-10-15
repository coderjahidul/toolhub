<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Contracts\ToolProcessor;
use App\Exceptions\ToolProcessingException;
use App\Support\DownloadName;

final class PdfCompressor implements ToolProcessor
{
    public function __construct(
        private readonly TempStore $temp,
        private readonly Ghostscript $ghostscript,
    ) {}

    public function slug(): string
    {
        return 'pdf-compress';
    }

    public function process(ProcessingInput $input): ProcessedFile
    {
        $source = $input->paths[0];
        FileGuard::assertPdf($source);
        $staged = $this->temp->make('pdf');

        if (! copy($source, $staged)) {
            throw new ToolProcessingException('The PDF could not be read.');
        }

        $output = $this->temp->make('pdf');

        try {
            $this->ghostscript->writePdf($output, [$staged], [
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS='.$this->setting((string) ($input->options['level'] ?? 'ebook')),
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
            ]);
        } catch (\Throwable $exception) {
            $this->temp->discard($output);
            throw $exception;
        } finally {
            $this->temp->discard($staged);
        }

        return new ProcessedFile(
            $output,
            DownloadName::make($input->originalNames[0] ?? 'document.pdf', 'compressed', 'pdf'),
            'application/pdf',
        );
    }

    private function setting(string $level): string
    {
        return match ($level) {
            'screen' => '/screen',
            'ebook' => '/ebook',
            'printer' => '/printer',
            default => throw new ToolProcessingException('Choose a compression level of screen, ebook, or printer.'),
        };
    }
}
