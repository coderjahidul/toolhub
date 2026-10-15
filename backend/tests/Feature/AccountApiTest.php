<?php

namespace Tests\Feature;

use App\Models\StoredFile;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_account_payload(): void
    {
        $registered = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'password' => 'password1',
            'password_confirmation' => 'password1',
        ]);

        $registered->assertCreated();
        $token = $registered->json('token');
        $this->assertIsString($token);
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $registered->json('user.id'),
            'plan' => 'free',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'ada@example.com',
            'password' => 'wrong-pass',
        ])->assertUnprocessable();

        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('plan', 'free');
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_signed_in_processing_saves_a_file_and_counts_toward_the_user(): void
    {
        $user = User::factory()->create();
        Subscription::query()->create(['user_id' => $user->id, 'plan' => 'free', 'status' => 'active']);
        Sanctum::actingAs($user);

        $response = $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('photo.jpg'),
            'quality' => 70,
        ]);

        $response->assertOk();
        $this->assertSame($user->id, $user->toolUsages()->first()->user_id);
        $this->assertSame(1, StoredFile::query()->where('user_id', $user->id)->count());

        $file = StoredFile::query()->first();
        $download = $this->get('/api/v1/account/files/'.$file->id);
        $download->assertOk();
        $this->assertStringStartsWith("\xFF\xD8", $download->getContent());

        $this->deleteJson('/api/v1/account/files/'.$file->id)->assertOk();
        $this->assertSame(0, StoredFile::query()->count());
    }

    public function test_api_key_authenticates_a_tool_request(): void
    {
        $user = User::factory()->create();
        Subscription::query()->create(['user_id' => $user->id, 'plan' => 'free', 'status' => 'active']);
        $token = $user->createToken('web')->plainTextToken;

        $created = $this->withToken($token)->postJson('/api/v1/account/api-keys', [
            'name' => 'Local script',
        ]);
        $created->assertCreated();
        $plain = $created->json('plain_text');
        $this->assertStringStartsWith('thub_', $plain);

        $this->withToken($plain)->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('photo.jpg'),
            'quality' => 80,
        ])->assertOk();

        $this->assertNotNull($user->apiKeys()->first()->last_used_at);
        $this->withToken($plain)->postJson('/api/v1/account/api-keys', ['name' => 'Nope'])->assertForbidden();
        $this->withToken('thub_not-a-real-key')->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_pro_plan_skips_the_daily_limit(): void
    {
        config(['toolhub.daily_limit' => 1]);
        $user = User::factory()->create();
        Subscription::query()->create(['user_id' => $user->id, 'plan' => 'pro', 'status' => 'active']);
        Sanctum::actingAs($user);

        $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('one.jpg'),
            'quality' => 70,
        ])->assertOk();

        $this->post('/api/v1/image/compress', [
            'file' => $this->imageUpload('two.jpg'),
            'quality' => 70,
        ])->assertOk();
    }

    public function test_google_sign_in_redirects_home_when_unconfigured(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
            'toolhub.frontend_url' => 'http://localhost:3000',
        ]);

        $this->get('/auth/google')->assertRedirect('http://localhost:3000/login?google=unconfigured');
        $this->getJson('/api/v1/auth/config')->assertJsonPath('google', false);
    }

    private function imageUpload(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'img');
        $image = imagecreatetruecolor(20, 20);
        $color = imagecolorallocate($image, 16, 110, 102);
        imagefilledrectangle($image, 0, 0, 20, 20, $color);
        imagejpeg($image, $path, 90);
        imagedestroy($image);

        return new UploadedFile($path, $name, 'image/jpeg', null, true);
    }
}
