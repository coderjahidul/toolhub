<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_an_admin_can_save_search_and_adsense_settings(): void
    {
        $this->getJson('/api/v1/settings')
            ->assertOk()
            ->assertJsonPath('adsense.enabled', false)
            ->assertJsonPath('search_console.verification', '');

        $member = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        $payload = [
            'adsense' => [
                'enabled' => true,
                'publisher_id' => 'ca-pub-1234567890123456',
                'slots' => [
                    'header-banner' => '1111111111',
                    'home-inline' => '',
                    'tool-sidebar' => '2222222222',
                    'blog-index' => '',
                    'blog-sidebar' => '',
                ],
            ],
            'search_console' => [
                'verification' => '<meta name="google-site-verification" content="abcDEF_123-xyz" />',
            ],
        ];

        $this->putJson('/api/v1/admin/settings', $payload)->assertForbidden();
        $this->withToken($member->createToken('web')->plainTextToken)
            ->putJson('/api/v1/admin/settings', $payload)
            ->assertForbidden();

        $this->app['auth']->forgetGuards();

        $this->withToken($admin->createToken('web')->plainTextToken)
            ->putJson('/api/v1/admin/settings', $payload)
            ->assertOk()
            ->assertJsonPath('adsense.publisher_id', 'ca-pub-1234567890123456')
            ->assertJsonPath('adsense.slots.header-banner', '1111111111')
            ->assertJsonPath('search_console.verification', 'abcDEF_123-xyz');

        $this->getJson('/api/v1/settings')->assertJsonPath('search_console.verification', 'abcDEF_123-xyz');

        $this->app['auth']->forgetGuards();
        $this->withToken($admin->createToken('web')->plainTextToken)
            ->putJson('/api/v1/admin/settings', [
                ...$payload,
                'adsense' => [...$payload['adsense'], 'publisher_id' => 'pub-123'],
            ])
            ->assertUnprocessable();

        $this->withToken($admin->createToken('web')->plainTextToken)
            ->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('adsense_enabled', true)
            ->assertJsonPath('search_console_ready', true);
    }

    public function test_admin_user_list_is_paged_at_twenty(): void
    {
        $admin = User::factory()->create(['name' => 'Owner']);
        $admin->forceFill(['is_admin' => true])->save();
        User::factory()->count(20)->create();

        $member = User::factory()->create();
        $this->withToken($member->createToken('web')->plainTextToken)
            ->getJson('/api/v1/admin/users')
            ->assertForbidden();

        $this->app['auth']->forgetGuards();

        $first = $this->withToken($admin->createToken('web')->plainTextToken)
            ->getJson('/api/v1/admin/users?page=1');

        $first->assertOk()
            ->assertJsonPath('per_page', 20)
            ->assertJsonPath('total', 22)
            ->assertJsonPath('last_page', 2)
            ->assertJsonCount(20, 'users');
        $this->assertArrayNotHasKey('password', $first->json('users.0'));

        $this->app['auth']->forgetGuards();
        $this->withToken($admin->createToken('web')->plainTextToken)
            ->getJson('/api/v1/admin/users?page=2')
            ->assertOk()
            ->assertJsonCount(2, 'users')
            ->assertJsonPath('page', 2);
    }
}
