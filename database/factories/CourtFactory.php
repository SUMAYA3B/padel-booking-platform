<?php

namespace Database\Factories;

use App\Models\Court;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Court>
 */
class CourtFactory extends Factory
{
    protected $model = Court::class;

    public function definition(): array
    {
        return [
            'name' => 'ملعب ' . $this->faker->unique()->numberBetween(1, 99),
            'description' => $this->faker->sentence(),
            'price_per_hour' => $this->faker->randomFloat(2, 8, 20),
            'is_active' => true,
            'is_covered' => $this->faker->boolean(),
        ];
    }
}
