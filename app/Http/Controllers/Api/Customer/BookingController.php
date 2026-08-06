<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreBookingRequest;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\ThawaniPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private ThawaniPaymentService $thawaniPaymentService,
    ) {}

    /**
     * Create a new booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking($request->validated());
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 409);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }

        $data = $booking->toArray();

        // إرفاق الأوقات غير المتاحة (إن وجدت) عند حجز السلات المتاحة فقط
        // في الحجز متعدد السلات، مع بقاء السلات المتاحة محجوزة بنجاح.
        $unavailable = $booking->unavailable_hours ?? null;

        $response = [
            'message' => 'تم إنشاء الحجز بنجاح.',
            'data' => $data,
        ];
        if (! empty($unavailable)) {
            $response['message'] = 'تم حجز الأوقات المتاحة، بينما هذه الأوقات كانت محجوزة مسبقاً';
            $response['unavailable_slots'] = $unavailable;
        }

        // If Thawani payment requested, create the session.
        if ($request->input('payment_method') === Booking::PAYMENT_THAWANI) {
            try {
                $payment = $this->thawaniPaymentService->createSession($booking);
                $response['payment'] = $payment;
            } catch (\RuntimeException $e) {
                $response['payment'] = [
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json($response, 201);
    }

    /**
     * Show a booking by its booking number.
     */
    public function show(string $bookingNumber): JsonResponse
    {
        $booking = Booking::where('booking_number', $bookingNumber)
            ->with(['court', 'offer', 'slots.court'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'الحجز غير موجود.'], 404);
        }

        return response()->json(['data' => $booking]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(string $bookingNumber, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $booking = $this->bookingService->cancelBooking($bookingNumber, $validated['reason'] ?? null);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'الحجز غير موجود.'], 404);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }

        return response()->json([
            'message' => 'تم إلغاء الحجز بنجاح.',
            'data' => $booking,
        ]);
    }

    /**
     * Thawani payment callback / webhook verification.
     */
    public function thawaniCallback(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id')
            ?? $request->query('session_id');

        if (! $sessionId) {
            return response()->json(['message' => 'معرّف جلسة مفقود.'], 422);
        }

        $result = $this->thawaniPaymentService->verifySession($sessionId);

        return response()->json($result);
    }
}

