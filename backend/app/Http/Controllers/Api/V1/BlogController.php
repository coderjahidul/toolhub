<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Support\Markdown;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Blog::query()->published()->latest('published_at')->get();

        return response()->json([
            'posts' => $posts->map(fn (Blog $post) => $this->summary($post))->values(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Blog::query()->published()->where('slug', $slug)->firstOrFail();
        $related = Blog::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->when($post->category, fn ($query) => $query->where('category', $post->category))
            ->latest('published_at')
            ->limit(3)
            ->get()
            ->map(fn (Blog $item) => $this->summary($item))
            ->values();

        return response()->json([
            'post' => [
                ...$this->summary($post),
                'html' => Markdown::toHtml($post->body),
            ],
            'related' => $related,
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->admin($request);

        $posts = Blog::query()->latest()->get()->map(fn (Blog $post) => $this->editable($post));

        return response()->json(['posts' => $posts]);
    }

    public function adminShow(Request $request, Blog $blog): JsonResponse
    {
        $this->admin($request);

        return response()->json(['post' => $this->editable($blog)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->admin($request);
        $post = Blog::query()->create($this->validated($request));

        return response()->json(['post' => $this->editable($post)], 201);
    }

    public function update(Request $request, Blog $blog): JsonResponse
    {
        $this->admin($request);
        $blog->update($this->validated($request, $blog));

        return response()->json(['post' => $this->editable($blog)]);
    }

    public function destroy(Request $request, Blog $blog): JsonResponse
    {
        $this->admin($request);
        $blog->delete();

        return response()->json(['message' => 'Guide deleted.']);
    }

    private function validated(Request $request, ?Blog $existing = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('blogs', 'slug')->ignore($existing?->id)],
            'excerpt' => ['required', 'string', 'max:300'],
            'body' => ['required', 'string', 'max:20000'],
            'category' => ['nullable', 'string', Rule::in(['image', 'pdf', 'developer'])],
            'published' => ['required', 'boolean'],
        ]);

        $slug = filled($data['slug'] ?? null) ? $data['slug'] : Str::slug($data['title']);
        if ($slug === '') {
            throw ValidationException::withMessages([
                'title' => 'Use a title that can become a URL slug.',
            ]);
        }

        $publishedAt = null;
        if ($data['published']) {
            $publishedAt = $existing?->published_at ?? now();
        }

        return [
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'],
            'body' => $data['body'],
            'category' => $data['category'] ?? null,
            'published_at' => $publishedAt,
        ];
    }

    private function editable(Blog $post): array
    {
        return [
            ...$this->summary($post),
            'body' => $post->body,
            'published' => $post->published_at !== null,
        ];
    }

    private function admin(Request $request): void
    {
        $user = $request->user();
        if ($user === null || ! $user->is_admin) {
            abort(403, 'Admin access is required.');
        }
    }

    private function summary(Blog $post): array
    {
        return [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'category' => $post->category,
            'published_at' => $post->published_at?->toIso8601String(),
            'updated_at' => $post->updated_at?->toIso8601String(),
        ];
    }
}
