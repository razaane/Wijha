<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Modules\Auth\Http\Requests\UpdateAvatarRequest;
use Modules\Auth\Http\Requests\UpdateProfileRequest;
use Modules\Auth\Http\Requests\SendPhoneOtpRequest;
use Modules\Auth\Http\Requests\VerifyPhoneOtpRequest;
use Modules\Core\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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

        $user->update($request->validated());

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
        
        // Simulate sending SMS by logging it
        Log::info("SMS OTP for User {$userId} to phone {$phone}: {$otp}");

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
}
