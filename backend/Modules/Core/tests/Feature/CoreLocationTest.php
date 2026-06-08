<?php

namespace Modules\Core\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Core\Models\City;
use Modules\Core\Models\Country;
use Modules\Core\Models\Region;
use Tests\TestCase;

class CoreLocationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $country = Country::create([
            'iso_code' => 'MA',
            'name' => ['en' => 'Morocco', 'fr' => 'Maroc'],
            'currency_code' => 'MAD'
        ]);

        $region = Region::create([
            'country_id' => $country->id,
            'slug' => 'marrakech-safi',
            'name' => ['en' => 'Marrakech-Safi', 'fr' => 'Marrakech-Safi'],
        ]);

        City::create([
            'region_id' => $region->id,
            'slug' => 'marrakech',
            'name' => ['en' => 'Marrakesh', 'fr' => 'Marrakech'],
            'latitude' => 31.6295,
            'longitude' => -7.9811,
        ]);
    }

    public function test_can_retrieve_regions()
    {
        $response = $this->getJson('/api/v1/core/locations/regions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'cover_url']
                ]
            ]);
            
        // Test translation header fallback
        $responseEn = $this->getJson('/api/v1/core/locations/regions', ['Accept-Language' => 'en']);
        $responseEn->assertJsonPath('data.0.name', 'Marrakech-Safi');
    }

    public function test_can_retrieve_cities()
    {
        $response = $this->getJson('/api/v1/core/locations/cities');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    '*' => [
                        'id', 'name', 'slug', 'description', 'latitude', 'longitude', 'region'
                    ]
                ]
            ]);
    }

    public function test_can_filter_cities_by_region()
    {
        $region = Region::first();
        
        $response = $this->getJson("/api/v1/core/locations/cities?region_id={$region->id}");
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($region->id, $response->json('data.0.region.id'));
    }
}
