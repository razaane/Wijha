<?php

namespace Modules\Admin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Auth\Models\IdentityVerification;
use Modules\Core\Traits\ApiResponse;

class KycController extends Controller
{
    use ApiResponse;

    /**
     * Get all KYC verifications, sorted by pending first.
     */
    public function index()
    {
        $verifications = IdentityVerification::with('user')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'approved' THEN 2 WHEN status = 'rejected' THEN 3 ELSE 4 END")
            ->latest()
            ->paginate(15);

        // Serialize media URLs
        $verifications->getCollection()->transform(function ($v) {
            $v->id_document_front_url = $v->getFirstMediaUrl('id_document_front');
            $v->id_document_back_url = $v->getFirstMediaUrl('id_document_back');
            $v->selfie_url = $v->getFirstMediaUrl('selfie');
            return $v;
        });

        return $this->successResponse($verifications, 'KYC verifications retrieved successfully.');
    }

    /**
     * Approve a verification request.
     */
    public function approve($id)
    {
        $verification = IdentityVerification::findOrFail($id);
        
        $verification->update([
            'status' => 'approved',
            'verified_at' => now(),
            'admin_notes' => null,
        ]);

        return $this->successResponse($verification, 'Host identity verified successfully.');
    }

    /**
     * Reject a verification request.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $verification = IdentityVerification::findOrFail($id);
        
        $verification->update([
            'status' => 'rejected',
            'admin_notes' => $request->reason,
            'verified_at' => null,
        ]);

        return $this->successResponse($verification, 'Host identity rejected successfully.');
    }
}
