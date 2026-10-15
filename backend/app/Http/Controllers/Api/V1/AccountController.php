<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Contracts\ObjectStorage;
use App\Http\Controllers\Controller;
use App\Models\StoredFile;
use App\Models\ToolUsage;
use App\Services\AccountProvisioner;
use App\Services\ApiKeyIssuer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AccountController extends Controller
{
    public function __construct(
        private readonly AccountProvisioner $accounts,
        private readonly ApiKeyIssuer $keys,
        private readonly ObjectStorage $storage,
    ) {}

    public function usage(Request $request): JsonResponse
    {
        $user = $this->user($request);
        $limit = max(1, (int) config('toolhub.daily_limit'));
        $subscription = $this->accounts->ensureFreePlan($user);
        $used = ToolUsage::query()
            ->where('user_id', $user->id)
            ->where('status', 'success')
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        $history = ToolUsage::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(50)
            ->get(['tool_slug', 'bytes_in', 'status', 'created_at']);

        return response()->json([
            'plan' => $subscription->plan,
            'unlimited' => $subscription->isUnlimited(),
            'limit' => $limit,
            'used' => $used,
            'remaining' => $subscription->isUnlimited() ? null : max(0, $limit - $used),
            'history' => $history,
        ]);
    }

    public function files(Request $request): JsonResponse
    {
        $user = $this->user($request);
        $files = StoredFile::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(100)
            ->get(['id', 'tool_slug', 'filename', 'mime', 'bytes', 'created_at']);

        return response()->json(['files' => $files]);
    }

    public function download(Request $request, StoredFile $file): Response
    {
        $user = $this->user($request);
        if ($file->user_id !== $user->id) {
            abort(404);
        }

        $contents = $this->storage->get($file->path);
        if ($contents === null) {
            abort(404);
        }

        return response($contents, 200, [
            'Content-Type' => $file->mime,
            'Content-Disposition' => 'attachment; filename="'.$file->filename.'"',
        ]);
    }

    public function destroyFile(Request $request, StoredFile $file): JsonResponse
    {
        $user = $this->user($request);
        if ($file->user_id !== $user->id) {
            abort(404);
        }

        $this->storage->delete($file->path);
        $file->delete();

        return response()->json(['message' => 'File deleted.']);
    }

    public function keys(Request $request): JsonResponse
    {
        $user = $this->user($request);
        $keys = $user->apiKeys()->latest()->get(['id', 'name', 'prefix', 'last_used_at', 'created_at']);

        return response()->json(['keys' => $keys]);
    }

    public function storeKey(Request $request): JsonResponse
    {
        if ($request->attributes->get('via_api_key') === true) {
            return response()->json(['message' => 'Create keys from the dashboard, not with an API key.'], 403);
        }

        $user = $this->user($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        if ($user->apiKeys()->count() >= 5) {
            return response()->json(['message' => 'You can keep up to 5 API keys.'], 422);
        }

        $issued = $this->keys->issue($user, $data['name']);

        return response()->json([
            'plain_text' => $issued['plain'],
            'key' => [
                'id' => $issued['key']->id,
                'name' => $issued['key']->name,
                'prefix' => $issued['key']->prefix,
                'created_at' => $issued['key']->created_at,
            ],
        ], 201);
    }

    public function destroyKey(Request $request, int $apiKey): JsonResponse
    {
        $user = $this->user($request);
        $key = $user->apiKeys()->whereKey($apiKey)->firstOrFail();
        $key->delete();

        return response()->json(['message' => 'API key revoked.']);
    }

    private function user(Request $request): \App\Models\User
    {
        $user = $request->user();
        if ($user === null) {
            abort(401, 'Unauthenticated.');
        }

        return $user;
    }
}
