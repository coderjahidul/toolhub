<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;

class AccountProvisioner
{
    public function ensureFreePlan(User $user): Subscription
    {
        return Subscription::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['plan' => 'free', 'status' => 'active'],
        );
    }
}
