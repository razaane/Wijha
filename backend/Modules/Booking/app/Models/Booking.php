<?php

namespace Modules\Booking\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Booking\Database\Factories\BookingFactory;

class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'listing_id',
        'listing_ticket_id',
        'total_amount',
        'currency',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function listing()
    {
        return $this->belongsTo(\Modules\Listing\Models\Listing::class);
    }

    public function ticket()
    {
        return $this->belongsTo(\Modules\Listing\Models\ListingTicket::class, 'listing_ticket_id');
    }
    
    public function payment()
    {
        return $this->hasOne(\Modules\Payment\Models\Payment::class);
    }

    public function disputes()
    {
        return $this->hasMany(\Modules\Payment\Models\Dispute::class);
    }

    // protected static function newFactory(): BookingFactory
    // {
    //     // return BookingFactory::new();
    // }
}
