<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiFormRequest;

class UpdateCourtRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price_per_hour' => ['sometimes', 'required', 'numeric', 'min:0.5'],
            'is_active' => ['sometimes', 'boolean'],
            'is_covered' => ['sometimes', 'boolean'],
        ];
    }
}
