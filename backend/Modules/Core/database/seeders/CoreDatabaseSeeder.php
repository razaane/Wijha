<?php

namespace Modules\Core\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Core\Models\City;
use Modules\Core\Models\Country;
use Modules\Core\Models\Region;

class CoreDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Country: Morocco
        $morocco = Country::firstOrCreate(
            ['iso_code' => 'MA'],
            [
                'name' => [
                    'fr' => 'Maroc',
                    'en' => 'Morocco',
                    'ar' => 'المغرب',
                ],
                'currency_code' => 'MAD',
            ]
        );

        // 2. Create Major Regions of Morocco
        $regionsData = [
            [
                'name' => ['fr' => 'Marrakech-Safi', 'en' => 'Marrakech-Safi', 'ar' => 'مراكش - آسفي'],
                'slug' => Str::slug('Marrakech-Safi'),
                'description' => [
                    'fr' => 'Région historique connue pour la ville rouge, les montagnes de l\'Atlas et la côte de Safi.',
                    'en' => 'Historic region known for the red city, the Atlas mountains, and the Safi coast.',
                    'ar' => 'منطقة تاريخية تشتهر بالمدينة الحمراء وجبال الأطلس وساحل آسفي.',
                ],
                'cities' => [
                    [
                        'name' => ['fr' => 'Marrakech', 'en' => 'Marrakesh', 'ar' => 'مراكش'],
                        'slug' => Str::slug('Marrakech'),
                        'latitude' => 31.6295,
                        'longitude' => -7.9811,
                    ],
                    [
                        'name' => ['fr' => 'Essaouira', 'en' => 'Essaouira', 'ar' => 'الصويرة'],
                        'slug' => Str::slug('Essaouira'),
                        'latitude' => 31.5085,
                        'longitude' => -9.7595,
                    ]
                ]
            ],
            [
                'name' => ['fr' => 'Casablanca-Settat', 'en' => 'Casablanca-Settat', 'ar' => 'الدار البيضاء - سطات'],
                'slug' => Str::slug('Casablanca-Settat'),
                'description' => [
                    'fr' => 'Le cœur économique du Maroc.',
                    'en' => 'The economic heart of Morocco.',
                    'ar' => 'القلب الاقتصادي للمغرب.',
                ],
                'cities' => [
                    [
                        'name' => ['fr' => 'Casablanca', 'en' => 'Casablanca', 'ar' => 'الدار البيضاء'],
                        'slug' => Str::slug('Casablanca'),
                        'latitude' => 33.5731,
                        'longitude' => -7.5898,
                    ]
                ]
            ],
            [
                'name' => ['fr' => 'Tanger-Tétouan-Al Hoceïma', 'en' => 'Tanger-Tetouan-Al Hoceima', 'ar' => 'طنجة - تطوان - الحسيمة'],
                'slug' => Str::slug('Tanger-Tetouan-Al Hoceima'),
                'description' => [
                    'fr' => 'Le nord du Maroc, où la Méditerranée rencontre l\'Atlantique.',
                    'en' => 'Northern Morocco, where the Mediterranean meets the Atlantic.',
                    'ar' => 'شمال المغرب حيث يلتقي البحر الأبيض المتوسط بالمحيط الأطلسي.',
                ],
                'cities' => [
                    [
                        'name' => ['fr' => 'Tanger', 'en' => 'Tangier', 'ar' => 'طنجة'],
                        'slug' => Str::slug('Tanger'),
                        'latitude' => 35.7595,
                        'longitude' => -5.8340,
                    ],
                    [
                        'name' => ['fr' => 'Chefchaouen', 'en' => 'Chefchaouen', 'ar' => 'شفشاون'],
                        'slug' => Str::slug('Chefchaouen'),
                        'latitude' => 35.1691,
                        'longitude' => -5.2636,
                    ]
                ]
            ]
        ];

        foreach ($regionsData as $rData) {
            $region = Region::firstOrCreate(
                ['slug' => $rData['slug']],
                [
                    'country_id' => $morocco->id,
                    'name' => $rData['name'],
                    'description' => $rData['description'],
                ]
            );

            foreach ($rData['cities'] as $cData) {
                City::firstOrCreate(
                    ['slug' => $cData['slug']],
                    [
                        'region_id' => $region->id,
                        'name' => $cData['name'],
                        'latitude' => $cData['latitude'],
                        'longitude' => $cData['longitude'],
                    ]
                );
            }
        }
    }
}
