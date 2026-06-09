<?php

namespace Modules\Listing\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Listing\Database\Factories\ListingFactory;
use App\Models\User;

class Listing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'price',
        'property_type',
        'privacy_type',
        'address_country',
        'address_street',
        'address_apt',
        'address_city',
        'address_province',
        'address_postal_code',
        'latitude',
        'longitude',
        'guests_count',
        'bedrooms_count',
        'beds_count',
        'bathrooms_count',
        'has_locks',
        'amenities',
        'safety_items',
        'photos',
    ];

    protected $casts = [
        'amenities' => 'array',
        'safety_items' => 'array',
        'photos' => 'array',
        'price' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'guests_count' => 'integer',
        'bedrooms_count' => 'integer',
        'beds_count' => 'integer',
        'bathrooms_count' => 'integer',
        'has_locks' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
