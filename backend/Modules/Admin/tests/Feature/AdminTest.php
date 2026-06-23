<?php

namespace Modules\Admin\Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_stats()
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN
        ]);

        $response = $this->actingAs($admin, 'api')->getJson('/api/v1/admin/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => ['pending_kyc', 'total_users', 'active_listings', 'monthly_revenue']]);
    }

    public function test_non_admin_cannot_access_stats()
    {
        $user = User::factory()->create([
            'role' => User::ROLE_USER
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/admin/stats');

        $response->assertStatus(403);
    }
}
