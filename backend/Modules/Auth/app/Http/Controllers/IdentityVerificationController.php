<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Auth\Models\IdentityVerification;
use Illuminate\Support\Facades\Auth;

class IdentityVerificationController extends Controller
{
    use ApiResponse;

    /**
     * Get the current user's identity verification status
     */
    public function show()
    {
        $verification = IdentityVerification::where('user_id', Auth::id())->latest()->first();
        return $this->successResponse($verification, 'Identity verification status retrieved.');
    }

    /**
     * Store a newly created identity verification request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'document_type' => 'required|in:id_card,passport',
            'id_document_front' => 'required|file|mimes:jpeg,png,jpg,webp,pdf|max:5120',
            'id_document_back' => 'required_if:document_type,id_card|file|mimes:jpeg,png,jpg,webp,pdf|max:5120',
            'selfie' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = Auth::user();

        // Check if there is already a pending or approved verification
        $existing = IdentityVerification::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return $this->errorResponse('already_exists', 'You already have a pending or approved identity verification.', 400);
        }

        $verification = IdentityVerification::create([
            'user_id' => $user->id,
            'document_type' => $request->document_type,
            'status' => 'pending',
        ]);

        if ($request->hasFile('id_document_front')) {
            $verification->addMedia($request->file('id_document_front'))->toMediaCollection('id_document_front');
        }

        if ($request->hasFile('id_document_back')) {
            $verification->addMedia($request->file('id_document_back'))->toMediaCollection('id_document_back');
        }

        if ($request->hasFile('selfie')) {
            $verification->addMedia($request->file('selfie'))->toMediaCollection('selfie');
        }

        return $this->successResponse($verification, 'Identity verification submitted successfully. It is now pending review.', 201);
    }
}
