<?php

namespace Tests\Unit;

use App\Services\Storage\LocalObjectStorage;
use App\Services\Storage\R2ObjectStorage;
use App\Support\DownloadName;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Tests\TestCase;

class StorageAndNamesTest extends TestCase
{
    public function test_download_names_are_sanitized(): void
    {
        $this->assertSame('photo-compressed.jpg', DownloadName::make('photo.jpg', 'compressed', 'jpg'));
        $this->assertSame('My-Photo-resized.png', DownloadName::make('My Photo!!.png', 'resized', 'png'));
        $this->assertSame('passwd.pdf', DownloadName::make('../../etc/passwd', '', 'pdf'));
        $this->assertSame('merged.pdf', DownloadName::make('merged', '', 'pdf'));
    }

    public function test_local_storage_round_trip_and_rejects_traversal(): void
    {
        Storage::fake('local');
        $storage = new LocalObjectStorage();
        $storage->put('saved/a.txt', 'hello');

        $this->assertSame('hello', $storage->get('saved/a.txt'));

        $storage->delete('saved/a.txt');

        $this->assertNull($storage->get('saved/a.txt'));
        $this->expectException(InvalidArgumentException::class);
        $storage->put('../.env', 'nope');
    }

    public function test_local_storage_has_no_temporary_url(): void
    {
        $this->expectException(RuntimeException::class);
        (new LocalObjectStorage())->temporaryUrl('saved/a.txt', now()->addMinutes(5));
    }

    public function test_r2_adapter_uses_the_r2_disk(): void
    {
        Storage::fake('r2');
        $storage = new R2ObjectStorage();
        $storage->put('files/a.bin', 'data');

        $this->assertSame('data', $storage->get('files/a.bin'));

        $storage->delete('files/a.bin');

        $this->assertNull($storage->get('files/a.bin'));
    }
}
