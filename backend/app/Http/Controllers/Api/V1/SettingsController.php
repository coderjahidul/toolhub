<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\StoredFile;
use App\Models\ToolUsage;
use App\Models\User;
use App\Services\SiteSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function __construct(private readonly SiteSettings $settings) {}

    public function show(): JsonResponse
    {
        return response()->json($this->settings->publicPayload());
    }

    public function overview(Request $request): JsonResponse
    {
        $this->admin($request);
        $settings = $this->settings->publicPayload();

        return response()->json([
            'users' => User::query()->count(),
            'guides' => Blog::query()->published()->count(),
            'uses_today' => ToolUsage::query()->whereDate('created_at', now()->toDateString())->count(),
            'saved_files' => StoredFile::query()->count(),
            'adsense_enabled' => $settings['adsense']['enabled'] && $settings['adsense']['publisher_id'] !== '',
            'search_console_ready' => $settings['search_console']['verification'] !== '',
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->admin($request);
        $page = max(1, (int) $request->query('page', 1));
        $paginator = User::query()->with('subscription')->latest('id')->paginate(20, ['*'], 'page', $page);

        return response()->json([
            'users' => $paginator->getCollection()->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => (bool) $user->is_admin,
                'plan' => $user->subscription?->plan ?? 'free',
                'created_at' => $user->created_at?->toIso8601String(),
            ])->values(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->admin($request);
        $data = $request->validate([
            'adsense.enabled' => ['required', 'boolean'],
            'adsense.publisher_id' => ['nullable', 'string', 'regex:/^(ca-pub-\d{10,20})?$/'],
            'adsense.slots' => ['required', 'array'],
            'adsense.slots.*' => ['nullable', 'string', 'regex:/^\d{0,20}$/'],
            'search_console.verification' => ['nullable', 'string', 'max:200'],
        ]);

        $verification = $this->verificationToken((string) ($data['search_console']['verification'] ?? ''));
        $slots = [];
        foreach (SiteSettings::SLOTS as $slot) {
            $slots[$slot] = (string) ($data['adsense']['slots'][$slot] ?? '');
        }

        $saved = $this->settings->save([
            'adsense' => [
                'enabled' => $data['adsense']['enabled'],
                'publisher_id' => (string) ($data['adsense']['publisher_id'] ?? ''),
                'slots' => $slots,
            ],
            'search_console' => [
                'verification' => $verification,
            ],
        ]);

        return response()->json($saved);
    }

    private function verificationToken(string $value): string
    {
        $value = trim($value);
        if (preg_match('/content\s*=\s*["\']([^"\']+)["\']/', $value, $match) === 1) {
            $value = $match[1];
        }

        if ($value === '') {
            return '';
        }

        if (preg_match('/^[A-Za-z0-9_-]{8,128}$/', $value) !== 1) {
            throw ValidationException::withMessages([
                'search_console.verification' => 'Paste the Google verification code, or the full meta tag.',
            ]);
        }

        return $value;
    }

    private function admin(Request $request): void
    {
        $user = $request->user();
        if ($user === null || ! $user->is_admin) {
            abort(403, 'Admin access is required.');
        }
    }
}
