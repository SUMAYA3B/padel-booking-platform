<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourtRequest;
use App\Http\Requests\Admin\UpdateCourtRequest;
use App\Models\Court;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courts = Court::query()
            ->with(['workingHours', 'closedDates', 'offers'])
            ->search($request->query('search'))
            ->when($request->query('active') !== null, function ($query) use ($request) {
                $query->where('is_active', (bool) $request->query('active'));
            })
            ->orderBy('id')
            ->paginate($request->query('per_page', 15));

        return response()->json(['data' => $courts]);
    }

    public function store(StoreCourtRequest $request): JsonResponse
    {
        $court = Court::create($request->validated());

        return response()->json([
            'message' => 'تم إضافة الملعب بنجاح.',
            'data' => $court->load('workingHours'),
        ], 201);
    }

    public function show(Court $court): JsonResponse
    {
        return response()->json([
            'data' => $court->load(['workingHours', 'closedDates', 'offers']),
        ]);
    }

    public function update(UpdateCourtRequest $request, Court $court): JsonResponse
    {
        $court->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث الملعب بنجاح.',
            'data' => $court->fresh(),
        ]);
    }

    public function destroy(Court $court): JsonResponse
    {
        $court->delete();

        return response()->json(['message' => 'تم حذف الملعب بنجاح.']);
    }
}
