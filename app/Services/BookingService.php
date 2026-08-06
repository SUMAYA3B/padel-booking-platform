<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\ClosedDate;
use App\Models\Court;
use App\Models\WorkingHour;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        private AvailabilityService $availabilityService,
        private PricingService $pricingService,
    ) {}

    /**
     * Create a booking.
     *
     * Supports two payload shapes:
     *  - Legacy single-slot: booking_date + start_time + end_time.
     *  - Multi-slot: a `slots` array where each slot has booking_date + start_time + end_time.
     *    This allows a customer to distribute hours across different dates/times in one payment.
     *
     * @param array{
     *     customer_name: string,
     *     customer_phone: string,
     *     customer_email?: string|null,
     *     booking_date?: string,
     *     start_time?: string,
     *     end_time?: string,
     *     slots?: array<int, array{booking_date: string, start_time: string, end_time: string}>,
     *     payment_method: string,
     *     notes?: string|null
     * } $data
     *
     * @throws \DomainException
     * @throws \InvalidArgumentException
     */
    public function createBooking(array $data): Booking
    {
        if (! empty($data['slots']) && is_array($data['slots'])) {
            return $this->createMultiSlotBooking($data);
        }

        return $this->createSingleSlotBooking($data);
    }

    /**
     * Create a booking with a single time slot (legacy behaviour).
     */
    private function createSingleSlotBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $this->validateDate($data['booking_date']);
            $this->validateStartTimeNotPast($data['booking_date'], $data['start_time']);
            $this->validateRateLimits($data);

            // فحص التوفر مع قفل الصفوف لمنع التعارض عند الحجز المتزامن
            $court = $this->findAvailableCourt(
                $data['booking_date'],
                $data['start_time'],
                $data['end_time'],
                lock: true
            );

            if (! $court) {
                throw new \DomainException(
                    'هذه الفترة محجوزة بالفعل. يرجى اختيار وقت آخر.',
                    409
                );
            }

            $priceInfo = $this->pricingService->calculatePrice(
                $court,
                $data['start_time'],
                $data['end_time']
            );

            $isCash = $data['payment_method'] === Booking::PAYMENT_CASH;

            $booking = Booking::create([
                'court_id' => $court->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'total_price' => $priceInfo['base_total'],
                'discounted_price' => $priceInfo['final_price'],
                'offer_id' => $priceInfo['offer']['id'] ?? null,
                'status' => $isCash ? Booking::STATUS_CONFIRMED : Booking::STATUS_PENDING,
                'payment_method' => $data['payment_method'],
                'payment_status' => Booking::PAYMENT_UNPAID,
                'notes' => $data['notes'] ?? null,
            ]);

            $booking->slots()->create([
                'court_id' => $court->id,
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'price' => $priceInfo['base_total'],
            ]);

            return $booking->load(['court', 'offer', 'slots.court']);
        });
    }

    /**
     * Create a booking spanning multiple time slots which may be spread
     * across different dates and times (created in a single payment).
     *
     * Unlike strict behaviour, this method skips any slot that is already
     * booked and keeps booking the remaining available slots. Conflict info
     * is collected and exposed so the client can inform the customer which
     * times were unavailable.
     */
    private function createMultiSlotBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            if ($data['payment_method'] !== Booking::PAYMENT_CASH && $data['payment_method'] !== Booking::PAYMENT_THAWANI) {
                throw new \InvalidArgumentException('طريقة دفع غير صالحة.', 422);
            }

            $resolvedSlots = [];
            $unavailable = [];

            // أولاً: نتحقق من كل سلة ونحجز الملعب المتاح لها (مع قفل الصفوف
            // المشغولة لمنع التعارض عند الحجز المتزامن من عدة مستخدمين).
            foreach ($data['slots'] as $slot) {
                $this->validateDate($slot['booking_date']);
                $this->validateStartTimeNotPast($slot['booking_date'], $slot['start_time']);

                $court = $this->findAvailableCourt(
                    $slot['booking_date'],
                    $slot['start_time'],
                    $slot['end_time'],
                    lock: true
                );

                if (! $court) {
                    // الأوقات غير المتاحة تُجمَع ولا تُفشل العملية كاملة.
                    $unavailable[] = [
                        'booking_date' => $slot['booking_date'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                    ];
                    continue;
                }

                $price = $this->pricingService->calculatePrice(
                    $court,
                    $slot['start_time'],
                    $slot['end_time']
                );

                $resolvedSlots[] = [
                    'court' => $court,
                    'booking_date' => $slot['booking_date'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'price' => $price['base_total'],
                ];
            }

            // إذا لم يتبقَّ أي سلة قابلة للحجز، نُفشل العملية مع رسالة واضحة.
            if (empty($resolvedSlots)) {
                throw new \DomainException(
                    'جميع الأوقات المختارة محجوزة بالفعل. يرجى اختيار أوقات أخرى.',
                    409
                );
            }

            $totalHours = count($resolvedSlots);

            if ($totalHours <= 0 || $totalHours > 8) {
                throw new \InvalidArgumentException('مدة الحجز يجب أن تكون بين ساعة و 8 ساعات.', 422);
            }

            // حساب السعر الإجمالي بناءً على عدد الساعات والأيام الناجحة فعلياً.
            $baseTotal = round(array_sum(array_column($resolvedSlots, 'price')), 2);

            $first = $resolvedSlots[0];
            $offerEnd = Carbon::parse($first['start_time'])->addHours($totalHours)->format('H:i');
            $priceInfo = $this->pricingService->calculatePrice(
                $first['court'],
                $first['start_time'],
                $offerEnd
            );
            $priceInfo['base_total'] = $baseTotal;

            $isCash = $data['payment_method'] === Booking::PAYMENT_CASH;

            $booking = Booking::create([
                'court_id' => $first['court']->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                // القيم الأولى تُستخدم كقيم تجميعية في جدول الحجوزات
                'booking_date' => $first['booking_date'],
                'start_time' => $first['start_time'],
                'end_time' => $first['end_time'],
                'total_price' => $priceInfo['base_total'],
                'discounted_price' => $priceInfo['final_price'],
                'offer_id' => $priceInfo['offer']['id'] ?? null,
                'status' => $isCash ? Booking::STATUS_CONFIRMED : Booking::STATUS_PENDING,
                'payment_method' => $data['payment_method'],
                'payment_status' => Booking::PAYMENT_UNPAID,
                'notes' => $data['notes'] ?? null,
                // إجمالي الساعات الناجحة + الأوقات غير المتاحة (JSON)
                'total_hours' => $totalHours,
                'unavailable_hours' => empty($unavailable) ? null : $unavailable,
            ]);

            foreach ($resolvedSlots as $slot) {
                $booking->slots()->create([
                    'court_id' => $slot['court']->id,
                    'booking_date' => $slot['booking_date'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'price' => $slot['price'],
                ]);
            }

            $booking->load(['court', 'offer', 'slots.court']);

            return $booking;
        });
    }

    public function cancelBooking(string $bookingNumber, ?string $reason = null): Booking
    {
        $booking = Booking::where('booking_number', $bookingNumber)->first();

        if (! $booking) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('الحجز غير موجود.');
        }

        if (! $booking->can_be_cancelled) {
            throw new \DomainException('لا يمكن إلغاء هذا الحجز في حالته الحالية.', 400);
        }

        $booking->markAsCancelled($reason);

        return $booking->fresh(['court', 'offer']);
    }

    /**
     * Assign a random available court for the requested time.
     *
     * Reverse-compatible wrapper around findAvailableCourt (no row locking).
     */
    private function assignRandomCourt(string $date, string $start, string $end): ?Court
    {
        return $this->findAvailableCourt($date, $start, $end, lock: false);
    }

    /**
     * Find an available court for a given slot.
     *
     * When $lock is true the conflicting (active) booking rows are locked
     * with "FOR UPDATE" so that two concurrent bookings cannot both pass the
     * availability check for the same court/time (prevents double-booking).
     */
    private function findAvailableCourt(string $date, string $start, string $end, bool $lock): ?Court
    {
        if ($this->isGloballyClosed($date)) {
            return null;
        }

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        // جلب جميع الملاعب النشطة مع ساعات عملها وأيام إغلاقها.
        $candidateCourts = Court::active()
            ->whereDoesntHave('closedDates', function ($query) use ($date) {
                $query->whereDate('date', $date);
            })
            ->whereHas('workingHours', function ($query) use ($dayOfWeek, $start, $end) {
                $query->where('day_of_week', $dayOfWeek)
                    ->where('is_active', true)
                    ->whereTime('open_time', '<=', $start)
                    ->whereTime('close_time', '>', $start);
            })
            ->with('workingHours')
            ->get();

        if ($candidateCourts->isEmpty()) {
            return null;
        }

        // نفحص كل ملعب بدوره ونرجع أول ملعب متاح. داخل القفل نقفل صفوف
        // الحجوزات/السلات المشغولة للملاعب المرشحة في الفترة المعنية لمنع
        // أن يحجز مستخدمان نفس الوقت على نفس الملعب في لحظة واحدة.
        foreach ($candidateCourts as $court) {
            $free = $this->courtIsFree($court, $date, $start, $end, $lock);

            if ($free) {
                return $court;
            }
        }

        return null;
    }

    /**
     * Determine whether a given court is free for a slot, taking into account
     * both direct bookings and booking_slots (sub-slots of multi-slot bookings).
     */
    private function courtIsFree(Court $court, string $date, string $start, string $end, bool $lock): bool
    {
        $activeStatuses = [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED];

        // الفحص عبر جدول السلات (booking_slots) — المصدر الأساسي للمنع في
        // الحجز متعدد السلات، وهو موجود لأي حجز سواء كان سلة مفردة أو متعددة.
        $slotQuery = $court->slots()
            ->whereDate('booking_date', $date)
            ->where(function ($q) use ($start, $end) {
                $q->whereTime('start_time', '<', $end)
                  ->whereTime('end_time', '>', $start);
            })
            ->whereHas('booking', function ($q) use ($activeStatuses) {
                $q->whereIn('status', $activeStatuses);
            });

        // فحص مباشر عبر bookings لأي حجوزات قديمة أو شاذة ليس لها سلات.
        $bookingQuery = $court->bookings()
            ->whereDate('booking_date', $date)
            ->where(function ($q) use ($start, $end) {
                $q->whereTime('start_time', '<', $end)
                  ->whereTime('end_time', '>', $start);
            })
            ->whereIn('status', $activeStatuses);

        if ($lock) {
            // قفل الصفوف المتطابقة لضمان عدم ازدواج الحجز في الحالات المتزامنة.
            // (نقفل كلا الاستعلامين؛ قفل booking_slots يغطي الحجوزات الحديثة،
            // وقفل bookings يغطي الحجوزات الفردية القديمة).
            $slotConflict = $slotQuery->lockForUpdate()->exists();
            $bookingConflict = $bookingQuery->lockForUpdate()->exists();
        } else {
            $slotConflict = $slotQuery->exists();
            $bookingConflict = $bookingQuery->exists();
        }

        return ! $slotConflict && ! $bookingConflict;
    }

    private function isGloballyClosed(string $date): bool
    {
        return ClosedDate::query()
            ->whereNull('court_id')
            ->whereDate('date', $date)
            ->exists();
    }

    private function validateDate(string $date): void
    {
        $parsed = Carbon::parse($date);

        if ($parsed->isPast() && ! $parsed->isToday()) {
            throw new \InvalidArgumentException('لا يمكن الحجز في تاريخ سابق.', 422);
        }
    }

    /**
     * منع حجز وقت في اليوم الحالي سبق مروره (أوقات الماضية).
     */
    private function validateStartTimeNotPast(string $date, string $startTime): void
    {
        if (Carbon::parse($date)->isToday() && Carbon::now()->format('H:i') >= $startTime) {
            throw new \InvalidArgumentException('لا يمكن حجز وقت مضى في اليوم الحالي.', 422);
        }
    }

    private function validateRateLimits(array $data): void
    {
        $start = Carbon::parse($data['start_time']);
        $end = Carbon::parse($data['end_time']);
        $hours = (int) round($start->diffInHours($end));

        if ($hours <= 0 || $hours > 8) {
            throw new \InvalidArgumentException('مدة الحجز يجب أن تكون بين ساعة و 8 ساعات.', 422);
        }

        if ($data['payment_method'] !== Booking::PAYMENT_CASH && $data['payment_method'] !== Booking::PAYMENT_THAWANI) {
            throw new \InvalidArgumentException('طريقة دفع غير صالحة.', 422);
        }
    }
}
