<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            'phone' => ['nullable', 'string', 'regex:/^\+?[1-9]\d{6,14}$/', 'unique:users,phone'],
            'locale' => ['nullable', 'string', 'in:en,fr,ar'],
            'otp' => ['required', 'string', 'size:6'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please tell us your name.',
            'name.min' => 'Your name must be at least 2 characters long.',
            'email.required' => 'We need your email address to create your account.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'An account with this email already exists. Try logging in instead.',
            'password.required' => 'A password is required to secure your account.',
            'password.confirmed' => 'The passwords you entered do not match.',
            
            // Customizing the Password rule messages
            'password.min' => 'For your security, your password must be at least 8 characters long.',
            'password.mixed' => 'Your password must include both uppercase and lowercase letters.',
            'password.numbers' => 'Your password needs to contain at least one number.',
            'password.symbols' => 'Please include at least one special character (like @, #, $, etc.).',
            'password.uncompromised' => 'This password has appeared in a public data leak. Please choose a more secure one.',
            
            'otp.required' => 'Please enter the verification code we sent to your email.',
            'otp.size' => 'The verification code must be exactly 6 digits.',
        ];
    }
}
