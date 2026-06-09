<?php

namespace Modules\Listing\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\app\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ListingController extends Controller
{
    /**
     * Store a newly created listing in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'location' => 'required|string',
            'price' => 'required|numeric|min:0',
            'amenities' => 'nullable|array',
            'photos' => 'nullable|array',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $listing = new Listing($validated);
        $listing->user_id = $user->id;
        $listing->save();

        // Upgrade user to partner if they aren't one already
        if ($user->role !== User::ROLE_PARTNER && $user->role !== User::ROLE_ADMIN) {
            $user->role = User::ROLE_PARTNER;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Listing created successfully.',
            'data' => [
                'listing' => $listing,
                'user' => $user
            ]
        ], 201);
    }
}
