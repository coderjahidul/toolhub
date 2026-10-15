<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_blog_lists_only_published_posts(): void
    {
        Blog::query()->create([
            'slug' => 'visible-post',
            'title' => 'Visible post',
            'excerpt' => 'A published note.',
            'body' => "## Hello\n\nSee the [compressor](/tool/image-compressor).",
            'category' => 'image',
            'published_at' => now(),
        ]);
        Blog::query()->create([
            'slug' => 'draft-post',
            'title' => 'Draft post',
            'excerpt' => 'Not public.',
            'body' => 'Hidden',
            'category' => 'pdf',
            'published_at' => null,
        ]);

        $this->getJson('/api/v1/blog')
            ->assertOk()
            ->assertJsonCount(1, 'posts')
            ->assertJsonPath('posts.0.slug', 'visible-post');

        $shown = $this->getJson('/api/v1/blog/visible-post')
            ->assertOk()
            ->assertJsonPath('post.html', '<h2>Hello</h2>'."\n".'<p>See the <a href="/tool/image-compressor">compressor</a>.</p>');
        $this->assertIsString($shown->json('post.updated_at'));
        $this->assertNotSame('', $shown->json('post.updated_at'));

        $this->getJson('/api/v1/blog/draft-post')->assertNotFound();
    }

    public function test_only_an_admin_can_add_and_edit_a_guide(): void
    {
        $member = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        $payload = [
            'title' => 'New guide',
            'excerpt' => 'Short summary for the list.',
            'body' => 'A **useful** paragraph.',
            'category' => 'pdf',
            'published' => false,
        ];

        $this->postJson('/api/v1/admin/guides', $payload)->assertForbidden();
        $this->withToken($member->createToken('web')->plainTextToken)
            ->postJson('/api/v1/admin/guides', $payload)
            ->assertForbidden();

        $this->app['auth']->forgetGuards();

        $created = $this->withToken($admin->createToken('web')->plainTextToken)
            ->postJson('/api/v1/admin/guides', $payload);

        $created->assertCreated()->assertJsonPath('post.slug', 'new-guide')->assertJsonPath('post.published', false);
        $this->getJson('/api/v1/blog/new-guide')->assertNotFound();

        $id = $created->json('post.id');
        $this->app['auth']->forgetGuards();
        $this->withToken($admin->createToken('web')->plainTextToken)
            ->putJson('/api/v1/admin/guides/'.$id, [...$payload, 'published' => true, 'title' => 'Updated guide'])
            ->assertOk()
            ->assertJsonPath('post.slug', 'updated-guide')
            ->assertJsonPath('post.published', true);

        $this->getJson('/api/v1/blog/updated-guide')->assertOk();
    }
}
