<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWorkingHourRequest;
use App\Models\WorkingHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkingHourController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WorkingHour::query()->with('court');

        if ($request->query('court_id')) {
            $query->where('court_id', $request->query('court_id'));
        }

        $data = $query->orderBy('court_id')->orderBy('day_of_week')->get();

        return response()->json(['data' => $data]);
    }

    public function store(StoreWorkingHourRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $existing = WorkingHour::where('court_id', $validated['court_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->first();

        if ($existing) {
            $existing->update($validated);
            $hour = $existing;
        } else {
            $hour = WorkingHour::create($validated);
        }

        return response()->json([
            'message' => 'تم حفظ ساعات العمل بنجاح.',
            'data' => $hour->load('court'),
        ], 201);
    }

    public function update(StoreWorkingHourRequest $request, WorkingHour $workingHour): JsonResponse
    {
        $workingHour->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث ساعات العمل.',
            'data' => $workingHour->fresh()->load('court'),
        ]);
    }

    public function destroy(WorkingHour $workingHour): JsonResponse
    {
        $workingHour->delete();

        return response()->json(['message' => 'تم حذف ساعات العمل.']);
    }
}
