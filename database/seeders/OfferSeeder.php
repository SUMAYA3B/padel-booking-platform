<?php

namespace Database\Seeders;

use App\Models\Offer;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        Offer::create([
            'name' => 'عرض ساعة واحدة',
            'description' => 'السعر الأساسي لحجز ساعة واحدة',
            'min_hours' => 1,
            'max_hours' => 1,
            'price_per_hour' => 10.00,
            'discount_percent' => null,
            'is_active' => true,
        ]);

        Offer::create([
            'name' => 'عرض ساعتين',
            'description' => 'توفير عند حجز ساعتين',
            'min_hours' => 2,
            'max_hours' => 2,
            'price_per_hour' => 8.00,
            'discount_percent' => null,
            'is_active' => true,
        ]);

        Offer::create([
            'name' => 'عرض 3-4 ساعات',
            'description' => 'أفضل قيمة لحجز 3 إلى 4 ساعات',
            'min_hours' => 3,
            'max_hours' => 4,
            'price_per_hour' => 7.00,
            'discount_percent' => null,
            'is_active' => true,
        ]);

        Offer::create([
            'name' => 'خصم الحجوزات الطويلة',
            'description' => 'خصم 15% على الحجوزات من 5 ساعات فأكثر',
            'min_hours' => 5,
            'max_hours' => null,
            'price_per_hour' => null,
            'discount_percent' => 15.00,
            'is_active' => true,
        ]);
    }
}
