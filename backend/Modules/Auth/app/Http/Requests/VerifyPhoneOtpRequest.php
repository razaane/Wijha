<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyPhoneOtpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userId = auth('api')->id();

        return [
            'phone' => [
                'required',
                'string',
                'regex:/^\+?[1-9]\d{6,14}$/',
                Rule::unique('users', 'phone')->ignore($userId)
            ],
            'otp' => [
                'required',
                'string',
                'size:6'
            ],
        ];
    }
}
