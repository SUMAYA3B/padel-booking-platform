<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiFormRequest;

class StoreWorkingHourRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'court_id' => ['required', 'integer', 'exists:courts,id'],
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            // وقت الفتح/الإغلاق قد يأتي بصيغة HH:MM أو HH:MM:SS
            // (حقول الوقت في MySQL تكفي الثواني دائماً مثل 06:00:00).
            'open_time' => ['required', 'date_format:H:i,H:i:s'],
            'close_time' => ['required', 'date_format:H:i,H:i:s'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.required' => 'الملعب مطلوب.',
            'day_of_week.between' => 'اليوم يجب أن يكون بين 0 و 6.',
            'open_time.required' => 'وقت الفتح مطلوب.',
            'close_time.required' => 'وقت الإغلاق مطلوب.',
        ];
    }
}

