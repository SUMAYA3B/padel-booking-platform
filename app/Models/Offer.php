<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'min_hours',
        'max_hours',
        'price_per_hour',
        'discount_percent',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'price_per_hour' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'is_active' => 'boolean',
            'min_hours' => 'integer',
            'max_hours' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function courts(): BelongsToMany
    {
        return $this->belongsToMany(Court::class, 'offer_court');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrentlyValid($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('start_date')->orWhereDate('start_date', '<=', now()->toDateString());
        })->where(function ($q) {
            $q->whereNull('end_date')->orWhereDate('end_date', '>=', now()->toDateString());
        });
    }

    public function scopeForHours($query, int $hours)
    {
        return $query->where('min_hours', '<=', $hours)
            ->where(function ($q) use ($hours) {
                $q->whereNull('max_hours')->orWhere('max_hours', '>=', $hours);
            });
    }

    /**
     * Check if this offer applies to a given court.
     * An offer with no attached courts applies to all courts.
     */
    public function appliesTo(Court $court): bool
    {
        if ($this->courts()->count() === 0) {
            return true;
        }

        return $this->courts()->whereKey($court->id)->exists();
    }

    /**
     * Calculate the price for N hours given a base hourly price.
     */
    public function calculatePrice(float $baseHourly, int $hours): float
    {
        if ($this->price_per_hour !== null) {
            return round($this->price_per_hour * $hours, 2);
        }

        if ($this->discount_percent !== null) {
            $total = $baseHourly * $hours;
            return round($total * (1 - $this->discount_percent / 100), 2);
        }

        return round($baseHourly * $hours, 2);
    }
}
