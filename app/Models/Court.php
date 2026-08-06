<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Court extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'price_per_hour',
        'is_active',
        'is_covered',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_per_hour' => 'decimal:2',
            'is_active' => 'boolean',
            'is_covered' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * The individual booking slots assigned to this court.
     */
    public function slots(): HasMany
    {
        return $this->hasMany(BookingSlot::class);
    }

    public function workingHours(): HasMany
    {
        return $this->hasMany(WorkingHour::class);
    }

    public function closedDates(): HasMany
    {
        return $this->hasMany(ClosedDate::class);
    }

    public function offers(): BelongsToMany
    {
        return $this->belongsToMany(Offer::class, 'offer_court');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, ?string $term)
    {
        return $term
            ? $query->where('name', 'LIKE', "%{$term}%")
            : $query;
    }

    /**
     * Determine if the court is closed on a given date.
     */
    public function isClosedOn(string $date): bool
    {
        return $this->closedDates()->whereDate('date', $date)->exists();
    }

    /**
     * Get the effective working hours for a given day of week.
     */
    public function workingHoursForDay(int $dayOfWeek): ?WorkingHour
    {
        return $this->workingHours()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();
    }
}
