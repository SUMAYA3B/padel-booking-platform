<?php

namespace App\Services;

use App\Models\Court;
use App\Models\Offer;

class PricingService
{
    /**
     * Calculate the price for a booking on a given court.
     *
     * @return array{
     *     hours: int,
     *     base_price_per_hour: float,
     *     base_total: float,
     *     offer: array{id: int, name: string, discount_amount: float}|null,
     *     final_price: float
     * }
     */
    public function calculatePrice(Court $court, string $startTime, string $endTime): array
    {
        $hours = max(1, (int) round((strtotime($endTime) - strtotime($startTime)) / 3600));
        $baseHourly = (float) $court->price_per_hour;
        $baseTotal = round($baseHourly * $hours, 2);

        $offer = $this->findBestOffer($court, $hours);

        $finalPrice = $baseTotal;
        $discountAmount = 0.0;

        if ($offer) {
            $offerTotal = $offer->calculatePrice($baseHourly, $hours);
            $discountAmount = round($baseTotal - $offerTotal, 2);
            $finalPrice = $offerTotal;
        }

        return [
            'hours' => $hours,
            'base_price_per_hour' => $baseHourly,
            'base_total' => $baseTotal,
            'offer' => $offer ? [
                'id' => $offer->id,
                'name' => $offer->name,
                'discount_amount' => $discountAmount,
            ] : null,
            'final_price' => $finalPrice,
        ];
    }

    private function findBestOffer(Court $court, int $hours): ?Offer
    {
        $candidates = Offer::query()
            ->active()
            ->currentlyValid()
            ->forHours($hours)
            ->get()
            ->filter(fn (Offer $offer) => $offer->appliesTo($court));

        if ($candidates->isEmpty()) {
            return null;
        }

        // Pick the candidate that yields the lowest price.
        return $candidates->sortBy(
            fn (Offer $offer) => $offer->calculatePrice((float) $court->price_per_hour, $hours)
        )->first();
    }
}
