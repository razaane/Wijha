<?php

namespace Modules\Payment\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Payment\Database\Factories\PaymentFactory;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'host_id',
        'amount',
        'currency',
        'stripe_charge_id',
        'status',
        'release_date',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'release_date' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(\Modules\Booking\Models\Booking::class);
    }

    public function host()
    {
        return $this->belongsTo(\App\Models\User::class, 'host_id');
    }

    protected static function newFactory(): PaymentFactory
    {
        return PaymentFactory::new();
    }
}
