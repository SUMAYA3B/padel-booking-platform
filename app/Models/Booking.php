<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    /**
     * Accessors appended to the model's array/JSON form so the final
     * (discounted) price is available to the frontend for display/payment.
     *
     * @var list<string>
     */
    protected $appends = ['final_price'];

    protected $fillable = [
        'booking_number',
        'court_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'booking_date',
        'start_time',
        'end_time',
        'total_price',
        'discounted_price',
        'offer_id',
        'status',
        'payment_method',
        'payment_status',
        'payment_reference',
        'notes',
        'unavailable_hours',
        'total_hours',
        'cancellation_reason',
        'cancelled_at',
        'thawani_session_id',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'total_price' => 'float',
            'discounted_price' => 'float',
            'unavailable_hours' => 'array',
            'total_hours' => 'int',
            'cancelled_at' => 'datetime',
        ];
    }

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_COMPLETED = 'completed';

    public const PAYMENT_CASH = 'cash';
    public const PAYMENT_THAWANI = 'thawani';

    public const PAYMENT_UNPAID = 'unpaid';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_REFUNDED = 'refunded';

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function thawaniPayment(): HasOne
    {
        return $this->hasOne(ThawaniPayment::class);
    }

    /**
     * The individual time slots that make up this booking.
     * A single booking may contain multiple slots spread across
     * different dates and times (created in one payment).
     */
    public function slots()
    {
        return $this->hasMany(BookingSlot::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function scopeByDate($query, string $date)
    {
        return $query->whereDate('booking_date', $date);
    }

    public function scopeByStatus($query, ?string $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        return $term
            ? $query->where(function ($q) use ($term) {
                $q->where('customer_name', 'LIKE', "%{$term}%")
                  ->orWhere('customer_phone', 'LIKE', "%{$term}%")
                  ->orWhere('booking_number', 'LIKE', "%{$term}%");
            })
            : $query;
    }

    public function getFinalPriceAttribute(): float
    {
        return (float) ($this->discounted_price ?? $this->total_price);
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    public function getCanBeCancelledAttribute(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function getDurationAttribute(): int
    {
        return (int) round(
            (strtotime($this->end_time) - strtotime($this->start_time)) / 3600
        );
    }

    public function markAsPaid(?string $reference = null): void
    {
        $this->update([
            'payment_status' => self::PAYMENT_PAID,
            'payment_reference' => $reference ?: $this->payment_reference,
            'status' => self::STATUS_CONFIRMED,
        ]);
    }

    public function markAsCancelled(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    protected static function booted(): void
    {
        static::creating(function (self $booking) {
            $booking->booking_number = self::generateBookingNumber();
        });
    }

    private static function generateBookingNumber(): string
    {
        do {
            $number = 'BK-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        } while (self::where('booking_number', $number)->exists());

        return $number;
    }
}

