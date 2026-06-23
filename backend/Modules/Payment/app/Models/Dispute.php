<?php

namespace Modules\Payment\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Payment\Database\Factories\DisputeFactory;

class Dispute extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'user_id',
        'reason',
        'evidence_text',
        'status',
    ];

    public function booking()
    {
        return $this->belongsTo(\Modules\Booking\Models\Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    protected static function newFactory(): DisputeFactory
    {
        return DisputeFactory::new();
    }
}
