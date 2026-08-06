<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiFormRequest;

class StoreOfferRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'min_hours' => ['required', 'integer', 'min:1'],
            'max_hours' => ['nullable', 'integer', 'gte:min_hours'],
            'price_per_hour' => ['nullable', 'numeric', 'min:0', 'required_without:discount_percent'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100', 'required_without:price_per_hour'],
            'is_active' => ['sometimes', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'court_ids' => ['nullable', 'array'],
            'court_ids.*' => ['integer', 'exists:courts,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم العرض مطلوب.',
            'min_hours.required' => 'الحد الأدنى للساعات مطلوب.',
            'price_per_hour.required_without' => 'يجب تحديد السعر أو نسبة الخصم.',
            'discount_percent.required_without' => 'يجب تحديد السعر أو نسبة الخصم.',
        ];
    }
}
