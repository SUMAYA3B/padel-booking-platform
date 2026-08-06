<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiFormRequest;

class StoreCourtRequest extends ApiFormRequest
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
            'price_per_hour' => ['required', 'numeric', 'min:0.5'],
            'is_active' => ['sometimes', 'boolean'],
            'is_covered' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم الملعب مطلوب.',
            'price_per_hour.required' => 'سعر الساعة مطلوب.',
            'price_per_hour.min' => 'سعر الساعة يجب أن يكون أكبر من صفر.',
        ];
    }
}
