<?php

namespace Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class IdentityVerification extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'document_type',
        'status',
        'admin_notes',
        'verified_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('id_document_front')->singleFile();
        $this->addMediaCollection('id_document_back')->singleFile();
        $this->addMediaCollection('selfie')->singleFile();
    }

    // protected static function newFactory(): IdentityVerificationFactory
    // {
    //     // return IdentityVerificationFactory::new();
    // }
}
