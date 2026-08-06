<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['court', 'offer'])
            ->search($request->query('search'))
            ->byStatus($request->query('status'))
            ->when($request->query('date'), function ($query) use ($request) {
                $query->whereDate('booking_date', $request->query('date'));
            })
            ->when($request->query('payment_method'), function ($query) use ($request) {
                $query->where('payment_method', $request->query('payment_method'));
            })
            ->orderByDesc('created_at')
            ->paginate($request->query('per_page', 15));

        return response()->json(['data' => $bookings]);
    }

    public function show(Booking $booking): JsonResponse
    {
        return response()->json([
            'data' => $booking->load(['court', 'offer', 'thawaniPayment']),
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        $validated = $request->validated();

        if ($validated['status'] === Booking::STATUS_CANCELLED) {
            $booking->markAsCancelled($validated['cancellation_reason'] ?? null);
        } elseif ($validated['status'] === Booking::STATUS_COMPLETED) {
            $booking->markAsCompleted();
        } else {
            $booking->update(['status' => $validated['status']]);
        }

        return response()->json([
            'message' => 'تم تحديث حالة الحجز.',
            'data' => $booking->fresh(['court', 'offer']),
        ]);
    }
}
