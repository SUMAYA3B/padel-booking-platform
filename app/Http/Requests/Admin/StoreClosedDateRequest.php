<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiFormRequest;

class StoreClosedDateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'court_id' => ['nullable', 'integer', 'exists:courts,id'],
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'التاريخ مطلوب.',
            'date.date_format' => 'صيغة التاريخ يجب أن تكون Y-m-d.',
        ];
    }
}
