<?php

namespace Modules\Listing\Tests\Feature;

use Tests\TestCase;
use Modules\Listing\Models\Listing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class ListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_browse_listings_publicly()
    {
        $user = User::factory()->create();
        Listing::create([
            'user_id' => $user->id,
            'title' => 'Public Listing',
            'type' => 'rental',
            'price' => 100,
            'is_active' => true,
            'is_draft' => false,
        ]);

        $response = $this->getJson('/api/v1/listings/browse');

        $response->assertStatus(200)
                 ->assertJsonPath('data.data.0.title', 'Public Listing');
    }

    public function test_cannot_see_draft_in_public_browse()
    {
        $user = User::factory()->create();
        Listing::create([
            'user_id' => $user->id,
            'title' => 'Draft Listing',
            'type' => 'rental',
            'price' => 100,
            'is_active' => true,
            'is_draft' => true,
        ]);

        $response = $this->getJson('/api/v1/listings/browse');

        $response->assertStatus(200)
                 ->assertJsonCount(0, 'data.data');
    }
}
