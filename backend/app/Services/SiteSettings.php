<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SiteSetting;

class SiteSettings
{
    public const SLOTS = [
        'header-banner',
        'home-inline',
        'tool-sidebar',
        'blog-index',
        'blog-sidebar',
    ];

    public function publicPayload(): array
    {
        $stored = SiteSetting::query()->pluck('value', 'key');
        $slots = [];
        foreach (self::SLOTS as $slot) {
            $slots[$slot] = (string) ($stored['adsense_slot_'.$slot] ?? '');
        }

        return [
            'adsense' => [
                'enabled' => ($stored['adsense_enabled'] ?? '0') === '1',
                'publisher_id' => (string) ($stored['adsense_publisher_id'] ?? ''),
                'slots' => $slots,
            ],
            'search_console' => [
                'verification' => (string) ($stored['search_console_verification'] ?? ''),
            ],
        ];
    }

    public function save(array $payload): array
    {
        $pairs = [
            'adsense_enabled' => ! empty($payload['adsense']['enabled']) ? '1' : '0',
            'adsense_publisher_id' => (string) ($payload['adsense']['publisher_id'] ?? ''),
            'search_console_verification' => (string) ($payload['search_console']['verification'] ?? ''),
        ];

        foreach (self::SLOTS as $slot) {
            $pairs['adsense_slot_'.$slot] = (string) ($payload['adsense']['slots'][$slot] ?? '');
        }

        foreach ($pairs as $key => $value) {
            SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return $this->publicPayload();
    }
}
