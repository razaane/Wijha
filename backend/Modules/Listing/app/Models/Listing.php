<?php

namespace Modules\Listing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Listing\Database\Factories\ListingFactory;
use App\Models\User;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Listing extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

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
        'is_active',
        'is_draft',
    ];

    protected $casts = [
        'amenities' => 'array',
        'safety_items' => 'array',
        'price' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'guests_count' => 'integer',
        'bedrooms_count' => 'integer',
        'beds_count' => 'integer',
        'bathrooms_count' => 'integer',
        'has_locks' => 'boolean',
        'is_active' => 'boolean',
        'is_draft' => 'boolean',
    ];

    /**
     * Register the media collections for listings.
     * - 'photos': Multiple listing images (min 5 required by frontend).
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos');
    }

    /**
     * Register media conversions (auto-generate optimized sizes).
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(300)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(900)
            ->sharpen(5)
            ->nonQueued();
    }

    /**
     * Get all photo URLs with their conversions.
     */
    public function getPhotoUrlsAttribute(): array
    {
        return $this->getMedia('photos')->map(function (Media $media) {
            return [
                'id' => $media->id,
                'original' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'large' => $media->getUrl('large'),
            ];
        })->toArray();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities()
    {
        return $this->hasMany(ListingAvailability::class);
    }
}
