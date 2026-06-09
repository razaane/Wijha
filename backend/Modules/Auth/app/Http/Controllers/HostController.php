<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class HostController extends Controller
{
    /**
     * Apply to become a host/partner.
     * Upgrades the user's role to 'partner'.
     */
    public function apply(Request $request)
    {
        $request->validate([
            'propertyType' => 'required|string',
            'city' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // If already a partner or admin, just return success
        if (in_array($user->role, [User::ROLE_PARTNER, User::ROLE_ADMIN])) {
            return response()->json([
                'success' => true,
                'message' => 'You are already a host.',
                'data' => $user
            ]);
        }

        // Upgrade role to partner
        $user->role = User::ROLE_PARTNER;
        $user->save();

        // In a real app, we might also save the propertyType and city to a HostProfile table here.

        return response()->json([
            'success' => true,
            'message' => 'Congratulations! You are now a host.',
            'data' => $user
        ]);
    }
}
