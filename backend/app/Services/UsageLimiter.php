<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\DailyLimitExceededException;
use App\Models\ToolUsage;
use App\Models\User;
use Illuminate\Http\Request;

class UsageLimiter
{
    public function assertAllowed(Request $request): void
    {
        $user = $request->user();
        if ($user instanceof User && $user->subscription?->isUnlimited()) {
            return;
        }

        $limit = $this->limit();

        if ($this->successCount($request) >= $limit) {
            throw new DailyLimitExceededException($limit);
        }
    }

    public function record(Request $request, string $slug, int $bytes, string $status): int
    {
        $user = $request->user();

        ToolUsage::query()->create([
            'user_id' => $user instanceof User ? $user->id : null,
            'tool_slug' => $slug,
            'ip_hash' => $this->hash($request),
            'bytes_in' => max(0, $bytes),
            'status' => $status,
        ]);

        if ($user instanceof User && $user->subscription?->isUnlimited()) {
            return $this->limit();
        }

        return max(0, $this->limit() - $this->successCount($request));
    }

    private function successCount(Request $request): int
    {
        $query = ToolUsage::query()
            ->where('status', 'success')
            ->where('created_at', '>=', now()->startOfDay());

        $user = $request->user();
        if ($user instanceof User) {
            return $query->where('user_id', $user->id)->count();
        }

        return $query
            ->where('ip_hash', $this->hash($request))
            ->whereNull('user_id')
            ->count();
    }

    private function limit(): int
    {
        return max(1, (int) config('toolhub.daily_limit'));
    }

    private function hash(Request $request): string
    {
        return hash_hmac('sha256', (string) $request->ip(), (string) config('app.key'));
    }
}
