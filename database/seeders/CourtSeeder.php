<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\WorkingHour;
use Illuminate\Database\Seeder;

class CourtSeeder extends Seeder
{
    public function run(): void
    {
        $courts = [
            ['name' => 'ملعب 1', 'description' => 'ملعب داخلي مكيّف', 'price_per_hour' => 10.00, 'is_covered' => true],
            ['name' => 'ملعب 2', 'description' => 'ملعب خارجي', 'price_per_hour' => 12.00, 'is_covered' => false],
            ['name' => 'ملعب 3 - VIP', 'description' => 'ملعب فاخر مع إنارة LED', 'price_per_hour' => 15.00, 'is_covered' => true],
            ['name' => 'ملعب 4', 'description' => 'ملعب داخلي مع مرافق إضافية', 'price_per_hour' => 11.00, 'is_covered' => true],
        ];

        foreach ($courts as $courtData) {
            $court = Court::create($courtData);

            foreach (range(0, 6) as $day) {
                // Friday (5) opens later
                $open = $day === 5 ? '14:00' : '06:00';
                $close = $day === 5 ? '23:00' : '23:00';

                WorkingHour::create([
                    'court_id' => $court->id,
                    'day_of_week' => $day,
                    'open_time' => $open,
                    'close_time' => $close,
                    'is_active' => true,
                ]);
            }
        }
    }
}
