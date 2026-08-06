<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ClosedDate;
use App\Models\Court;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AvailabilityService
{
    private const SLOT_INTERVAL = 60; // 1-hour slots

    /**
     * Get available time slots for a given date, optionally for a number of days.
     *
     * @return Collection<int, array{
     *     date: string,
     *     start_time: string,
     *     end_time: string,
     *     available_courts: int
     * }>
     */
    public function getAvailableSlots(string $date, int $hours = 1, int $days = 1): Collection
    {
        $slots = collect();

        foreach (range(0, $days - 1) as $offset) {
            $current = Carbon::parse($date)->addDays($offset);

            if ($this->isGloballyClosed($current)) {
                continue;
            }

            $daySlots = $this->getDaySlots($current, $hours);
            $slots = $slots->merge($daySlots);
        }

        return $slots
            ->unique(fn ($slot) => $slot['date'] . '-' . $slot['start_time'] . '-' . $slot['end_time'])
            ->sortBy(fn ($slot) => $slot['date'] . ' ' . $slot['start_time'])
            ->values();
    }

    public function isGloballyClosed(Carbon $date): bool
    {
        return ClosedDate::query()
            ->whereNull('court_id')
            ->whereDate('date', $date->toDateString())
            ->exists();
    }

    private function getDaySlots(Carbon $date, int $hours): Collection
    {
        $courts = Court::active()->with(['workingHours', 'closedDates'])->get();
        $dayOfWeek = $date->dayOfWeek;
        $slots = collect();

        foreach ($courts as $court) {
            if ($court->isClosedOn($date->toDateString())) {
                continue;
            }

            $work = $court->workingHoursForDay($dayOfWeek);
            if (! $work) {
                continue;
            }

            $open = (int) substr($work->open_time, 0, 2);
            $close = (int) substr($work->close_time, 0, 2);

            // Extend slots into next day if close_time is past midnight (e.g. 00:00)
            if ($work->close_time === '00:00' || (int) substr($work->close_time, 0, 2) <= $open) {
                $close = 24;
            }

            $booked = $this->getBookedRanges($court, $date->toDateString());

            for ($start = $open; $start <= $close - $hours; $start++) {
                $slotStart = sprintf('%02d:00', $start % 24);
                $slotEnd = sprintf('%02d:00', ($start + $hours) % 24);

                // Include every slot within working hours.
                // Booked slots are marked unavailable (available_courts = 0)
                // so the frontend can show them as disabled.
                $slots->push([
                    'date' => $date->toDateString(),
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'court_id' => $court->id,
                    'court_name' => $court->name,
                    'is_booked' => ! $this->rangeFree($booked, $slotStart, $slotEnd),
                ]);
            }
        }

        // Group by time slot and count available courts
        return $slots
            ->groupBy(fn ($slot) => $slot['start_time'] . '-' . $slot['end_time'])
            ->map(function (Collection $group) {
                $first = $group->first();
                // A slot is unavailable when every available court is booked.
                $availableCount = $group->where('is_booked', false)->count();
                return [
                    'date' => $first['date'],
                    'start_time' => $first['start_time'],
                    'end_time' => $first['end_time'],
                    'available_courts' => $availableCount,
                    'is_available' => $availableCount > 0,
                    'courts' => $group->pluck('court_name'),
                ];
            })
            ->values();
    }

    /**
     * Build a full-day calendar for a given month.
     * Returns for every day of the month its closed status and working hours.
     *
     * @return \Illuminate\Support\Collection<int, array{
     *     date: string,
     *     day_of_week: int,
     *     is_closed: bool,
     *     open_time: string|null,
     *     close_time: string|null
     * }>
     */
    public function getMonthCalendar(string $month): \Illuminate\Support\Collection
    {
        $start = Carbon::parse($month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $closedDates = ClosedDate::query()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy(fn ($cd) => $cd->date->toDateString());

        $activeCourts = Court::active()->with('workingHours')->get();

        $days = collect();
        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $date = $day->toDateString();
            $globallyClosed = $closedDates->has($date)
                && $closedDates[$date]->contains(fn ($cd) => $cd->court_id === null);

            $work = $this->representativeWorkingHours($activeCourts, $day->dayOfWeek);

            $isClosed = $globallyClosed || $work === null;

            $days->push([
                'date' => $date,
                'day_of_week' => $day->dayOfWeek,
                'is_closed' => $isClosed,
                'open_time' => $work ? $work['open_time'] : null,
                'close_time' => $work ? $work['close_time'] : null,
            ]);
        }

        return $days;
    }

    /**
     * Determine representative working hours for a weekday across active courts.
     * Returns null if no active court has working hours on that day.
     *
     * @return array{open_time: string, close_time: string}|null
     */
    private function representativeWorkingHours(\Illuminate\Support\Collection $activeCourts, int $dayOfWeek): ?array
    {
        $hours = [];
        foreach ($activeCourts as $court) {
            $work = $court->workingHoursForDay($dayOfWeek);
            if ($work) {
                $hours[] = $work;
            }
        }

        if (empty($hours)) {
            return null;
        }

        // Earliest opening and latest closing across courts.
        $open = collect($hours)->min(fn ($w) => $w->open_time);
        $close = collect($hours)->max(fn ($w) => $w->close_time);

        return ['open_time' => $open, 'close_time' => $close];
    }

    private function getBookedRanges(Court $court, string $date): Collection
    {
        return Booking::query()
            ->where('court_id', $court->id)
            ->whereDate('booking_date', $date)
            ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
            ->get(['start_time', 'end_time']);
    }

    private function rangeFree(Collection $booked, string $start, string $end): bool
    {
        foreach ($booked as $item) {
            if ($start < $item->end_time && $end > $item->start_time) {
                return false;
            }
        }

        return true;
    }
}
