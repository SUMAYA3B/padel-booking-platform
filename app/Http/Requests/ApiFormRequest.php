<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

abstract class ApiFormRequest extends FormRequest
{
    /**
     * Override failed validation to return a JSON response for API clients.
     */
    protected function failedValidation(Validator $validator)
    {
        $exception = new ValidationException($validator);

        throw new HttpResponseException(
            response()->json([
                'message' => 'فشل التحقق من البيانات.',
                'errors' => $exception->errors(),
            ], 422)
        );
    }
}
