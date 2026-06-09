<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Modules\Auth\Http\Requests\UpdateAvatarRequest;
use Modules\Auth\Http\Requests\UpdateProfileRequest;
use Modules\Core\Traits\ApiResponse;

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
}
