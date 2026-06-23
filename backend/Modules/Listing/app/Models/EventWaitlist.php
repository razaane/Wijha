<?php

namespace Modules\Listing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Listing\Database\Factories\EventWaitlistFactory;

class EventWaitlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'ticket_tier_id',
        'user_id',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function ticketTier()
    {
        return $this->belongsTo(ListingTicket::class, 'ticket_tier_id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
