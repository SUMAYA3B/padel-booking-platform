<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\ClosedDateController;
use App\Http\Controllers\Api\Admin\CourtController as AdminCourtController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OfferController;
use App\Http\Controllers\Api\Admin\WorkingHourController;
use App\Http\Controllers\Api\Customer\AvailabilityController;
use App\Http\Controllers\Api\Customer\BookingController;
use App\Http\Controllers\Api\Customer\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes are prefixed with /api
*/

Route::prefix('v1')->group(function () {

    // =====================
    // Public / Customer
    // =====================

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Availability
    Route::get('/availability', [AvailabilityController::class, 'availableSlots']);
    Route::get('/availability/calendar', [AvailabilityController::class, 'calendar']);

    // Public offers (visible to visitors without auth)
    Route::get('/offers', [OfferController::class, 'publicIndex']);

    // Bookings
    Route::prefix('bookings')->group(function () {
        Route::post('/', [BookingController::class, 'store']);
        Route::get('/{bookingNumber}', [BookingController::class, 'show']);
        Route::post('/{bookingNumber}/cancel', [BookingController::class, 'cancel']);
    });

    // Payment
    Route::prefix('payment')->group(function () {
        // إنشاء جلسة دفع (إعادة محاولة الدفع لحجز قائم)
        Route::post('/create-session', [PaymentController::class, 'createSession']);
        // التحقق من حالة الدفع بعد عودة المستخدم من بوابة ثواني
        Route::post('/verify', [PaymentController::class, 'verify']);
        // Webhook من ثواني لتأكيد نجاح/فشل الدفع
        Route::post('/webhook', [PaymentController::class, 'webhook']);
    });

    // Payment callbacks
    Route::post('/thawani/callback', [BookingController::class, 'thawaniCallback']);

    // =====================
    // Authenticated routes
    // =====================
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // =====================
    // Admin (requires admin role)
    // =====================
    Route::prefix('admin')->group(function () {

        Route::post('/auth/login', [AuthController::class, 'adminLogin']);

        Route::middleware(['auth:sanctum', 'admin'])->group(function () {

            Route::get('/dashboard', [DashboardController::class, 'index']);

            Route::apiResource('courts', AdminCourtController::class);
            Route::apiResource('offers', OfferController::class);

            Route::get('/bookings', [AdminBookingController::class, 'index']);
            Route::get('/bookings/{booking}', [AdminBookingController::class, 'show']);
            Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus']);

            Route::get('/working-hours', [WorkingHourController::class, 'index']);
            Route::post('/working-hours', [WorkingHourController::class, 'store']);
            Route::put('/working-hours/{workingHour}', [WorkingHourController::class, 'update']);
            Route::delete('/working-hours/{workingHour}', [WorkingHourController::class, 'destroy']);

            Route::get('/closed-dates', [ClosedDateController::class, 'index']);
            Route::post('/closed-dates', [ClosedDateController::class, 'store']);
            Route::delete('/closed-dates/{closedDate}', [ClosedDateController::class, 'destroy']);
        });
    });
});

