<?php

declare(strict_types=1);

namespace App\Services\Tools;

use App\Contracts\ToolProcessor;
use App\Exceptions\ToolProcessingException;
use App\Support\DownloadName;
use setasign\Fpdi\Fpdi;

final class PdfMerger implements ToolProcessor
{
    public function __construct(
        private readonly TempStore $temp,
        private readonly Ghostscript $ghostscript,
    ) {}

    public function slug(): string
    {
        return 'pdf-merge';
    }

    public function process(ProcessingInput $input): ProcessedFile
    {
        $staged = $this->stage($input->paths);
        $output = $this->temp->make('pdf');

        try {
            $this->merge($staged, $output);
        } catch (\Throwable $exception) {
            $this->temp->discard($output);
            throw $exception;
        } finally {
            foreach ($staged as $path) {
                $this->temp->discard($path);
            }
        }

        return new ProcessedFile($output, DownloadName::make('merged', '', 'pdf'), 'application/pdf');
    }

    /**
     * @param  list<string>  $paths
     * @return list<string>
     */
    private function stage(array $paths): array
    {
        $staged = [];

        try {
            foreach ($paths as $path) {
                FileGuard::assertPdf($path);
                $copy = $this->temp->make('pdf');
                if (! copy($path, $copy)) {
                    throw new ToolProcessingException('A PDF could not be read.');
                }
                $staged[] = $copy;
            }
        } catch (\Throwable $exception) {
            foreach ($staged as $path) {
                $this->temp->discard($path);
            }

            throw $exception;
        }

        return $staged;
    }

    /**
     * @param  list<string>  $paths
     */
    private function merge(array $paths, string $output): void
    {
        try {
            $this->mergeWithFpdi($paths, $output);
        } catch (ToolProcessingException $exception) {
            throw $exception;
        } catch (\Throwable) {
            $this->temp->discard($output);
            $this->ghostscript->writePdf($output, $paths, [
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
            ]);
        }
    }

    /**
     * @param  list<string>  $paths
     */
    private function mergeWithFpdi(array $paths, string $output): void
    {
        $pdf = new Fpdi();
        $total = 0;
        $max = (int) config('toolhub.pdf_max_pages', 200);

        foreach ($paths as $path) {
            $pageCount = $pdf->setSourceFile($path);
            $total += $pageCount;

            if ($total > $max) {
                throw new ToolProcessingException("PDFs are limited to {$max} pages per merge.");
            }

            for ($page = 1; $page <= $pageCount; $page++) {
                $template = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($template);
                $orientation = $size['orientation'] ?? 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($template);
            }
        }

        $pdf->Output('F', $output);
    }
}
