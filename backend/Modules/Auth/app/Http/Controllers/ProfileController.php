<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Modules\Auth\Http\Requests\UpdateAvatarRequest;
use Modules\Auth\Http\Requests\UpdateProfileRequest;
use Modules\Auth\Http\Requests\SendPhoneOtpRequest;
use Modules\Auth\Http\Requests\VerifyPhoneOtpRequest;
use Modules\Auth\Http\Requests\SendEmailOtpRequest;
use Modules\Auth\Http\Requests\VerifyEmailOtpRequest;
use Modules\Core\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmailOtpMail;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Update the authenticated user's profile details.
     *
     * PUT /api/v1/profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        // Remove phone and email from the update request to prevent bypassing OTP
        $data = $request->validated();
        unset($data['phone']);
        unset($data['email']);

        $user->update($data);

        return $this->successResponse($user, 'Profile updated successfully.');
    }

    /**
     * Update the authenticated user's avatar image.
     *
     * POST /api/v1/profile/avatar
     */
    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');

            $user->update(['avatar' => $path]);
        }

        return $this->successResponse([
            'avatar_url' => asset('storage/' . $user->avatar),
            'user' => $user
        ], 'Avatar updated successfully.');
    }

    /**
     * Send an OTP to the user's new phone number.
     *
     * POST /api/v1/profile/phone/send-otp
     */
    public function sendPhoneOtp(SendPhoneOtpRequest $request): JsonResponse
    {
        $userId = auth('api')->id();
        $phone = $request->input('phone');
        
        $otp = (string) random_int(100000, 999999);
        
        Cache::put('phone_otp_' . $userId, [
            'phone' => $phone,
            'otp' => $otp
        ], now()->addMinutes(10));
        
        // Simulate sending SMS by logging it to both the log file and the terminal
        Log::info("SMS OTP for User {$userId} to phone {$phone}: {$otp}");
        if (app()->environment('local')) {
            error_log("!!! MOCK SMS OTP for User {$userId} to phone {$phone}: {$otp} !!!");
        }

        return $this->successResponse(
            message: 'Verification code sent to your phone number.'
        );
    }

    /**
     * Verify the OTP and update the user's phone number.
     *
     * POST /api/v1/profile/phone/verify
     */
    public function verifyPhoneOtp(VerifyPhoneOtpRequest $request): JsonResponse
    {
        $userId = auth('api')->id();
        $cachedData = Cache::get('phone_otp_' . $userId);

        if (!$cachedData || $cachedData['otp'] !== $request->input('otp') || $cachedData['phone'] !== $request->input('phone')) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'otp' => ['The verification code is invalid or has expired.'],
            ]);
        }

        Cache::forget('phone_otp_' . $userId);

        /** @var \App\Models\User $user */
        $user = auth('api')->user();
        $user->update(['phone' => $cachedData['phone']]);

        return $this->successResponse($user, 'Phone number updated successfully.');
    }

    /**
     * Send an OTP to the user's new email address.
     *
     * POST /api/v1/profile/email/send-otp
     */
    public function sendEmailOtp(SendEmailOtpRequest $request): JsonResponse
    {
        $userId = auth('api')->id();
        $email = $request->input('email');
        
        $otp = (string) random_int(100000, 999999);
        
        Cache::put('email_otp_' . $userId, [
            'email' => $email,
            'otp' => $otp
        ], now()->addMinutes(10));
        
        // Send the real email
        try {
            Mail::to($email)->send(new VerifyEmailOtpMail($otp));
            Log::info("Email OTP for User {$userId} sent to email {$email}");
        } catch (\Exception $e) {
            Log::error("Failed to send OTP email to {$email}: " . $e->getMessage());
            return $this->errorResponse('email_failed', 'Failed to send verification email. Please try again later.', 500);
        }

        return $this->successResponse(
            message: 'Verification code sent to your email address.'
        );
    }

    /**
     * Verify the OTP and update the user's email address.
     *
     * POST /api/v1/profile/email/verify
     */
    public function verifyEmailOtp(VerifyEmailOtpRequest $request): JsonResponse
    {
        $userId = auth('api')->id();
        $cachedData = Cache::get('email_otp_' . $userId);

        if (!$cachedData || $cachedData['otp'] !== $request->input('otp') || $cachedData['email'] !== $request->input('email')) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'otp' => ['The verification code is invalid or has expired.'],
            ]);
        }

        Cache::forget('email_otp_' . $userId);

        /** @var \App\Models\User $user */
        $user = auth('api')->user();
        $user->update(['email' => $cachedData['email']]);

        return $this->successResponse($user, 'Email address updated successfully.');
    }

    /**
     * Update the authenticated user's password.
     *
     * PUT /api/v1/auth/profile/password
     */
    public function updatePassword(\Illuminate\Http\Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('invalid_credentials', 'Current password does not match.', 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return $this->successResponse(null, 'Password updated successfully.');
    }
}
