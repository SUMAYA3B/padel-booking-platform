<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function __construct(
        private AvailabilityService $availabilityService
    ) {}

    /**
     * Get available time slots.
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'hours' => ['sometimes', 'integer', 'min:1', 'max:8'],
            'days' => ['sometimes', 'integer', 'min:1', 'max:7'],
        ]);

        $slots = $this->availabilityService->getAvailableSlots(
            $validated['date'],
            $validated['hours'] ?? 1,
            $validated['days'] ?? 1
        );

        return response()->json([
            'date' => $validated['date'],
            'hours' => $validated['hours'] ?? 1,
            'data' => $slots,
        ]);
    }

    /**
     * Get the full booking calendar for a given month.
     * Returns each day's closed status and working hours so the frontend
     * can render a monthly calendar and disable closed/unavailable days.
     */
    public function calendar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $days = $this->availabilityService->getMonthCalendar($validated['month']);

        return response()->json([
            'month' => $validated['month'],
            'data' => $days,
        ]);
    }
}
