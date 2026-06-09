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
        'location',
        'price',
        'amenities',
        'photos',
    ];

    protected $casts = [
        'amenities' => 'array',
        'photos' => 'array',
        'price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
