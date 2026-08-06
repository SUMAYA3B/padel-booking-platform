<?php

namespace Database\Factories;

use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
{
    protected $model = Offer::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'min_hours' => 1,
            'max_hours' => null,
            'price_per_hour' => $this->faker->randomFloat(2, 5, 15),
            'discount_percent' => null,
            'is_active' => true,
            'start_date' => null,
            'end_date' => null,
        ];
    }
}
