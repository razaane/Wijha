<?php

namespace Modules\Listing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Listing\Database\Factories\ListingEventMetaFactory;

class ListingEventMeta extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'start_datetime',
        'end_datetime',
        'venue_name',
        'age_restriction',
        'is_waitlist_enabled',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_waitlist_enabled' => 'boolean',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
