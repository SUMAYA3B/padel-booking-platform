<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThawaniPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'session_id',
        'amount',
        'status',
        'payment_method',
        'transaction_id',
        'response_data',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'response_data' => 'array',
        ];
    }

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function markAsPaid(array $data = []): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'transaction_id' => $data['transaction_id'] ?? null,
            'payment_method' => $data['payment_method'] ?? null,
            'response_data' => array_merge($this->response_data ?? [], $data),
        ]);
    }

    public function markAsFailed(array $data = []): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'response_data' => array_merge($this->response_data ?? [], $data),
        ]);
    }
}
