<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = auth('api')->id();

        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'locale' => ['nullable', 'string', 'in:en,fr,ar'],
            'preferred_currency' => ['nullable', 'string', 'max:3'],
            'preferred_language' => ['nullable', 'string', 'max:10'],
            'notification_preferences' => ['nullable', 'array'],
            'privacy_preferences' => ['nullable', 'array'],
            'ui_preferences' => ['nullable', 'array'],
        ];
    }
}
