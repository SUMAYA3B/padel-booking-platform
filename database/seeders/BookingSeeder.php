<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Court;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $court = Court::first();
        if (! $court) {
            return;
        }

        $samples = [
            [
                'customer_name' => 'أحمد محمد',
                'customer_phone' => '0551112222',
                'customer_email' => 'ahmed@example.com',
                'booking_date' => now()->toDateString(),
                'start_time' => '06:00',
                'end_time' => '08:00',
                'status' => Booking::STATUS_CONFIRMED,
                'payment_method' => Booking::PAYMENT_CASH,
                'payment_status' => Booking::PAYMENT_PAID,
            ],
            [
                'customer_name' => 'سارة علي',
                'customer_phone' => '0553334444',
                'customer_email' => 'sara@example.com',
                'booking_date' => now()->toDateString(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'status' => Booking::STATUS_PENDING,
                'payment_method' => Booking::PAYMENT_THAWANI,
                'payment_status' => Booking::PAYMENT_UNPAID,
            ],
            [
                'customer_name' => 'خالد حسن',
                'customer_phone' => '0555556666',
                'customer_email' => 'khaled@example.com',
                'booking_date' => now()->addDay()->toDateString(),
                'start_time' => '18:00',
                'end_time' => '21:00',
                'status' => Booking::STATUS_CONFIRMED,
                'payment_method' => Booking::PAYMENT_THAWANI,
                'payment_status' => Booking::PAYMENT_PAID,
            ],
        ];

        foreach ($samples as $sample) {
            $hours = (int) round((strtotime($sample['end_time']) - strtotime($sample['start_time'])) / 3600);
            $total = $court->price_per_hour * $hours;

            Booking::create(array_merge($sample, [
                'court_id' => $court->id,
                'total_price' => $total,
                'discounted_price' => $total,
            ]));
        }
    }
}
