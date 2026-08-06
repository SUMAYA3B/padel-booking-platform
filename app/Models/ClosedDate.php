<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClosedDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'court_id',
        'date',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * Scopes for global closures (all courts).
     */
    public function scopeForAllCourts($query)
    {
        return $query->whereNull('court_id');
    }

    public function scopeForDate($query, string $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereDate('date', '>=', now()->toDateString());
    }

    public function getAppliesToAttribute(): string
    {
        return $this->court_id === null ? 'all' : 'specific';
    }

    public function getCourtNameAttribute(): ?string
    {
        return $this->court?->name;
    }
}
