<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\AccountProvisioner;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! is_string($email) || $email === '' || ! is_string($password) || $password === '') {
            return;
        }

        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'ToolHub Admin',
                'password' => $password,
                'email_verified_at' => now(),
            ],
        );
        $user->forceFill(['is_admin' => true])->save();

        app(AccountProvisioner::class)->ensureFreePlan($user);
    }
}
