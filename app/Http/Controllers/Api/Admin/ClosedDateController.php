<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClosedDateRequest;
use App\Models\ClosedDate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClosedDateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ClosedDate::query()->with('court');

        if ($request->query('court_id')) {
            $query->where('court_id', $request->query('court_id'));
        }

        if ($request->query('upcoming') === '1') {
            $query->upcoming();
        }

        $data = $query->orderByDesc('date')->paginate($request->query('per_page', 15));

        return response()->json(['data' => $data]);
    }

    public function store(StoreClosedDateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $exists = ClosedDate::where('court_id', $validated['court_id'] ?? null)
            ->whereDate('date', $validated['date'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'هذا الإغلاق مسجل مسبقاً.'], 422);
        }

        $closedDate = ClosedDate::create($validated);

        return response()->json([
            'message' => 'تمت إضافة يوم الإغلاق.',
            'data' => $closedDate->load('court'),
        ], 201);
    }

    public function destroy(ClosedDate $closedDate): JsonResponse
    {
        $closedDate->delete();

        return response()->json(['message' => 'تم إزالة يوم الإغلاق.']);
    }
}
