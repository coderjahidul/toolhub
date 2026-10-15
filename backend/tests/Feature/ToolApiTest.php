<?php

namespace Tests\Feature;

use App\Models\ToolUsage;
use FPDF;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ToolApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_compress_resize_and_convert_images(): void
    {
        $compressed = $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('photo.jpg'),
            'quality' => 70,
        ]);

        $compressed->assertOk();
        $compressed->assertHeader('content-type', 'image/jpeg');
        $this->assertStringContainsString('photo-compressed.jpg', (string) $compressed->headers->get('content-disposition'));
        $this->assertStringStartsWith("\xFF\xD8", $this->body($compressed));

        $converted = $this->post('/api/v1/image/convert', [
            'file' => $this->imageUpload('photo.png'),
            'format' => 'webp',
        ]);

        $converted->assertOk();
        $converted->assertHeader('content-type', 'image/webp');
        $this->assertStringStartsWith('RIFF', $this->body($converted));

        $resized = $this->post('/api/v1/image/resize', [
            'file' => $this->imageUpload('photo.jpg', 40, 20),
            'width' => 10,
            'height' => 10,
            'maintain_aspect' => '0',
        ]);

        $resized->assertOk();
        $image = imagecreatefromstring($this->body($resized));
        $this->assertNotFalse($image);
        $this->assertSame(10, imagesx($image));
        $this->assertSame(10, imagesy($image));
        imagedestroy($image);

        $this->assertSame(3, ToolUsage::query()->where('status', 'success')->count());
        $this->assertNull(ToolUsage::query()->first()->user_id);
    }

    public function test_merge_and_compress_pdfs(): void
    {
        $merged = $this->post('/api/v1/pdf/merge', [
            'files' => [
                $this->pdfUpload('one.pdf', 'One'),
                $this->pdfUpload('two.pdf', 'Two'),
            ],
        ]);

        $merged->assertOk();
        $merged->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $this->body($merged));

        $compressed = $this->post('/api/v1/pdf/compress', [
            'file' => $this->pdfUpload('notes.pdf', 'Notes'),
            'level' => 'ebook',
        ]);

        $compressed->assertOk();
        $this->assertStringStartsWith('%PDF-', $this->body($compressed));
        $this->assertStringContainsString('notes-compressed.pdf', (string) $compressed->headers->get('content-disposition'));
    }

    public function test_daily_limit_blocks_the_next_server_operation(): void
    {
        config(['toolhub.daily_limit' => 1]);

        $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('photo.jpg'),
            'quality' => 80,
        ])->assertOk();

        $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('again.jpg'),
            'quality' => 80,
        ])->assertStatus(429)->assertJsonPath('limit', 1);

        $this->assertSame(1, ToolUsage::query()->where('status', 'success')->count());
    }

    public function test_rejects_invalid_and_oversized_uploads(): void
    {
        $this->post('/api/v1/image/compress', [
            'file' => UploadedFile::fake()->create('shell.php', 1, 'application/x-php'),
        ])->assertStatus(422);

        $this->post('/api/v1/pdf/compress', [
            'file' => UploadedFile::fake()->create('notes.txt', 1, 'text/plain'),
        ])->assertStatus(422);

        config(['toolhub.image_max_kb' => 1]);

        $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('large.jpg', 500, 500),
        ])->assertStatus(422);

        $this->assertSame(0, ToolUsage::query()->count());
    }

    public function test_php_upload_limit_returns_a_clear_message(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'img');
        file_put_contents($path, 'not-an-image');
        $upload = new UploadedFile($path, 'big.jpg', 'image/jpeg', UPLOAD_ERR_INI_SIZE, true);
        $limit = ini_get('upload_max_filesize') ?: '2M';

        $this->post('/api/v1/image/compress', [
            'file' => $upload,
            'quality' => 70,
        ])->assertStatus(422)->assertJsonPath(
            'message',
            "This file is larger than the server upload limit ({$limit}). Choose a smaller file.",
        );

        $this->assertSame(0, ToolUsage::query()->count());
    }

    public function test_resize_requires_a_dimension(): void
    {
        $this->post('/api/v1/image/resize', [
            'file' => $this->imageUpload('photo.jpg'),
        ])->assertStatus(422);
    }

    public function test_prune_command_removes_old_temp_files(): void
    {
        $directory = storage_path('app/tmp');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $old = $directory.'/old-temp.txt';
        $fresh = $directory.'/fresh-temp.txt';
        file_put_contents($old, 'old');
        file_put_contents($fresh, 'fresh');
        touch($old, time() - 7200);

        $this->artisan('toolhub:prune-temp', ['--minutes' => 60])->assertSuccessful();

        $this->assertFileDoesNotExist($old);
        $this->assertFileExists($fresh);
        unlink($fresh);
    }

    private function body(\Illuminate\Testing\TestResponse $response): string
    {
        $path = $response->baseResponse->getFile()->getPathname();

        return (string) file_get_contents($path);
    }

    private function imageUpload(string $name, int $width = 30, int $height = 20): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'img');
        $image = imagecreatetruecolor($width, $height);
        $color = imagecolorallocate($image, 16, 110, 102);
        imagefilledrectangle($image, 0, 0, $width, $height, $color);
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if ($extension === 'png') {
            imagepng($image, $path);
            $mime = 'image/png';
        } else {
            imagejpeg($image, $path, 90);
            $mime = 'image/jpeg';
        }

        imagedestroy($image);

        return new UploadedFile($path, $name, $mime, null, true);
    }

    private function pdfUpload(string $name, string $text): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'pdf');
        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(40, 10, $text);
        $pdf->Output('F', $path);

        return new UploadedFile($path, $name, 'application/pdf', null, true);
    }
}
