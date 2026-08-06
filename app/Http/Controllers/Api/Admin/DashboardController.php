<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Offer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard summary data.
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());
        $parsed = Carbon::parse($date);

        $totalRevenue = (float) Booking::query()
            ->where('payment_status', Booking::PAYMENT_PAID)
            ->sum('discounted_price');

        $todayBookings = Booking::whereDate('booking_date', $date)->count();

        $counts = [
            'total_courts' => Court::count(),
            'active_courts' => Court::active()->count(),
            'today_bookings' => $todayBookings,
            'pending_bookings' => Booking::byStatus(Booking::STATUS_PENDING)->count(),
            'confirmed_bookings' => Booking::byStatus(Booking::STATUS_CONFIRMED)->count(),
            'completed_bookings' => Booking::byStatus(Booking::STATUS_COMPLETED)->count(),
            'cancelled_bookings' => Booking::byStatus(Booking::STATUS_CANCELLED)->count(),
            'total_revenue' => $totalRevenue,
            'active_offers' => Offer::active()->count(),
        ];

        // Last 7 days booking counts
        $weeklyBookings = collect(range(6, 0))->map(function ($offset) use ($parsed) {
            $day = $parsed->copy()->subDays($offset);
            return [
                'date' => $day->toDateString(),
                'label' => $day->format('D'),
                'count' => Booking::whereDate('booking_date', $day->toDateString())->count(),
            ];
        });

        // Recent bookings
        $recentBookings = Booking::with(['court'])
            ->latest()
            ->take(5)
            ->get();

        // Bookings by status (for charts)
        $byStatus = [
            'pending' => $counts['pending_bookings'],
            'confirmed' => $counts['confirmed_bookings'],
            'completed' => $counts['completed_bookings'],
            'cancelled' => $counts['cancelled_bookings'],
        ];

        return response()->json([
            'data' => [
                'stats' => $counts,
                'weekly_bookings' => $weeklyBookings,
                'bookings_by_status' => $byStatus,
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }
}
