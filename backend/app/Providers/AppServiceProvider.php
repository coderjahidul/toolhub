<?php

namespace App\Providers;

use App\Console\ServeCommand;
use App\Contracts\ObjectStorage;
use App\Services\Storage\LocalObjectStorage;
use App\Services\Storage\R2ObjectStorage;
use Illuminate\Console\Application as Artisan;
use Illuminate\Support\ServiceProvider;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ImageManager::class, fn () => new ImageManager(new GdDriver()));

        $this->app->bind(ObjectStorage::class, function () {
            $key = config('filesystems.disks.r2.key');
            $bucket = config('filesystems.disks.r2.bucket');

            if (filled($key) && filled($bucket)) {
                return new R2ObjectStorage();
            }

            return new LocalObjectStorage();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Artisan::starting(function ($artisan): void {
            $artisan->add(new ServeCommand);
        });
    }
}
