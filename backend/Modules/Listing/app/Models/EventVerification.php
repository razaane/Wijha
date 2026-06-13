<?php

namespace Modules\Listing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Listing\Database\Factories\EventVerificationFactory;

class EventVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'status',
        'document_path',
        'admin_notes',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
