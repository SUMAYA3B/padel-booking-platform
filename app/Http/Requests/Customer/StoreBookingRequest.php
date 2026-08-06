<?php

namespace App\Http\Requests\Customer;

use App\Http\Requests\ApiFormRequest;
use App\Models\Booking;

class StoreBookingRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'regex:/^[97][0-9]{7}$/'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'booking_date' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'slots' => ['nullable', 'array', 'min:1', 'max:8'],
            'slots.*.booking_date' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'slots.*.start_time' => ['required', 'date_format:H:i'],
            'slots.*.end_time' => ['required', 'date_format:H:i', 'after:slots.*.start_time'],
            'payment_method' => ['required', 'in:' . Booking::PAYMENT_CASH . ',' . Booking::PAYMENT_THAWANI],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'الاسم الكامل مطلوب.',
            'customer_phone.required' => 'رقم الهاتف مطلوب.',
            'customer_phone.regex' => 'رقم الهاتف يجب أن يكون 8 أرقام ويبدأ بالرقم 9 أو 7 (بدون رمز البلد).',
            'booking_date.required' => 'التاريخ مطلوب.',
            'booking_date.after_or_equal' => 'لا يمكن الحجز في تاريخ سابق.',
            'start_time.required' => 'وقت البداية مطلوب.',
            'end_time.required' => 'وقت النهاية مطلوب.',
            'end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
            'slots.required' => 'يرجى اختيار وقت واحد على الأقل.',
            'slots.min' => 'يرجى اختيار وقت واحد على الأقل.',
            'slots.max' => 'لا يمكن أن يتجاوز إجمالي ساعات الحجز 8 ساعات.',
            'slots.*.booking_date.after_or_equal' => 'لا يمكن الحجز في تاريخ سابق.',
            'slots.*.end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
            'payment_method.in' => 'طريقة دفع غير صالحة.',
        ];
    }
}
