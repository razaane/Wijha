<?php

namespace Modules\Listing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Listing\Database\Factories\ListingAvailabilityFactory;

class ListingAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'date',
        'status',
        'custom_price',
    ];

    protected $casts = [
        'date' => 'date',
        'custom_price' => 'decimal:2',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    // protected static function newFactory(): ListingAvailabilityFactory
    // {
    //     // return ListingAvailabilityFactory::new();
    // }
}
