<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@padelpro.om'],
            [
                'name' => 'مدير النظام',
                'email' => 'admin@padelpro.om',
                'password' => Hash::make('password123'),
                'role' => User::ROLE_SUPER_ADMIN,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'staff@padelpro.om'],
            [
                'name' => 'موظف الاستقبال',
                'email' => 'staff@padelpro.om',
                'password' => Hash::make('password123'),
                'role' => User::ROLE_STAFF,
                'is_active' => true,
            ]
        );
    }
}
