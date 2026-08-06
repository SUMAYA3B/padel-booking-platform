<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Court;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $start = $this->faker->numberBetween(6, 20);
        $end = $start + 1;
        $price = $this->faker->randomFloat(2, 10, 50);

        return [
            'court_id' => Court::factory(),
            'customer_name' => $this->faker->name(),
            'customer_phone' => $this->faker->numerify('05########'),
            'customer_email' => $this->faker->safeEmail(),
            'booking_date' => $this->faker->dateTimeBetween('now', '+7 days')->format('Y-m-d'),
            'start_time' => sprintf('%02d:00', $start),
            'end_time' => sprintf('%02d:00', $end),
            'total_price' => $price,
            'discounted_price' => $price,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_method' => Booking::PAYMENT_CASH,
            'payment_status' => Booking::PAYMENT_UNPAID,
        ];
    }
}
