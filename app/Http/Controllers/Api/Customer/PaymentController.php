<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\ThawaniPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Handles Thawani payment session creation and webhook callbacks
 * for existing bookings that were created with payment_method = thawani.
 */
class PaymentController extends Controller
{
    public function __construct(
        private ThawaniPaymentService $thawaniPaymentService,
    ) {}

    /**
     * Create (or re-create) a Thawani checkout session for a booking.
     *
     * @bodyParam booking_reference string required رقم الحجز (booking_number)
     */
    public function createSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_reference' => ['required', 'string', 'max:50'],
        ]);

        $booking = Booking::where('booking_number', $validated['booking_reference'])->first();

        if (! $booking) {
            return response()->json(['message' => 'الحجز غير موجود.'], 404);
        }

        if ($booking->payment_method !== Booking::PAYMENT_THAWANI) {
            return response()->json(['message' => 'طريقة الدفع لهذا الحجز ليست عبر ثواني.'], 422);
        }

        if ($booking->isPaid) {
            return response()->json([
                'message' => 'تم دفع هذا الحجز بالفعل.',
                'booking_number' => $booking->booking_number,
                'paid' => true,
            ]);
        }

        try {
            $payment = $this->thawaniPaymentService->createSession($booking);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'payment' => ['error' => $e->getMessage()],
            ], $e->getCode() ?: 502);
        }

        return response()->json([
            'message' => 'تم إنشاء جلسة الدفع بنجاح.',
            'booking_number' => $booking->booking_number,
            'payment' => $payment,
        ]);
    }

    /**
     * Verify a booking's Thawani payment status after the customer returns
     * from the hosted checkout page (success/cancel return).
     *
     * Mirrors the reference thawani-payment project's success page behaviour:
     * it queries Thawani for the session status and updates the booking.
     *
     * @bodyParam booking_reference string required رقم الحجز (booking_number)
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_reference' => ['required', 'string', 'max:50'],
        ]);

        $booking = Booking::where('booking_number', $validated['booking_reference'])->first();

        if (! $booking) {
            return response()->json(['message' => 'الحجز غير موجود.'], 404);
        }

        // Already confirmed as paid — nothing to re-verify.
        if ($booking->isPaid) {
            return response()->json([
                'success' => true,
                'status' => 'paid',
                'paid' => true,
                'booking_number' => $booking->booking_number,
            ]);
        }

        $sessionId = $booking->thawani_session_id;

        if (! $sessionId) {
            return response()->json([
                'success' => false,
                'status' => 'no_session',
                'paid' => false,
                'booking_number' => $booking->booking_number,
                'message' => 'لا توجد جلسة دفع محفوظة لهذا الحجز.',
            ]);
        }

        try {
            $result = $this->thawaniPaymentService->verifySession($sessionId);
            $result['paid'] = ($result['status'] ?? '') === 'paid';

            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'paid' => $booking->isPaid,
                'booking_number' => $booking->booking_number,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 502);
        }
    }

    /**
     * Thawani webhook — verifies the payment result asynchronously.
     */
    public function webhook(Request $request): JsonResponse
    {
        // Accept JSON first, fall back to request input.
        $payload = $request->json()->all() ?: $request->all();

        if (empty($payload)) {
            return response()->json(['message' => 'حمولة فارغة.'], 422);
        }

        try {
            $result = $this->thawaniPaymentService->handleWebhook($payload);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }

        $status = $result['status'] ?? 'unknown';
        $httpStatus = ($status === 'paid') ? 200 : 200;

        return response()->json($result, $httpStatus);
    }
}
