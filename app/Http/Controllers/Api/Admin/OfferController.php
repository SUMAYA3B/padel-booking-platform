<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfferRequest;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $offers = Offer::query()
            ->with('courts')
            ->when($request->query('active') !== null, function ($query) use ($request) {
                $query->where('is_active', (bool) $request->query('active'));
            })
            ->orderByDesc('id')
            ->paginate($request->query('per_page', 15));

        return response()->json(['data' => $offers]);
    }

    /**
     * Public endpoint to list currently valid and active offers for visitors.
     * No authentication required.
     */
    public function publicIndex(): JsonResponse
    {
        $offers = Offer::query()
            ->active()
            ->currentlyValid()
            ->with('courts')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $offers]);
    }

    public function store(StoreOfferRequest $request): JsonResponse
    {
        $data = $request->validated();
        $courtIds = $data['court_ids'] ?? [];
        unset($data['court_ids']);

        // At least one pricing rule required.
        if (! isset($data['price_per_hour']) && ! isset($data['discount_percent'])) {
            return response()->json(['message' => 'يجب تحديد السعر أو نسبة الخصم.'], 422);
        }

        $offer = Offer::create($data);

        if (! empty($courtIds)) {
            $offer->courts()->sync($courtIds);
        }

        return response()->json([
            'message' => 'تم إضافة العرض بنجاح.',
            'data' => $offer->load('courts'),
        ], 201);
    }
    public function show(Offer $offer): JsonResponse
    {
        return response()->json(['data' => $offer->load('courts')]);
    }

    public function update(StoreOfferRequest $request, Offer $offer): JsonResponse
    {
        $data = $request->validated();
        $courtIds = $data['court_ids'] ?? null;
        unset($data['court_ids']);

        $offer->update($data);

        if ($courtIds !== null) {
            $offer->courts()->sync($courtIds);
        }

        return response()->json([
            'message' => 'تم تحديث العرض بنجاح.',
            'data' => $offer->fresh()->load('courts'),
        ]);
    }

    public function destroy(Offer $offer): JsonResponse
    {
        $offer->delete();

        return response()->json(['message' => 'تم حذف العرض بنجاح.']);
    }
}

