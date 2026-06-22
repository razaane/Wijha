<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // RBAC Roles
    public const ROLE_USER = 'user';
    public const ROLE_PARTNER = 'partner';
    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'locale',
        'provider_name',
        'provider_id',
        'preferred_currency',
        'preferred_language',
        'notification_preferences',
        'privacy_preferences',
        'ui_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'is_verified_host',
        'has_pending_verification',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_preferences' => 'array',
            'privacy_preferences' => 'array',
            'ui_preferences' => 'array',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
        ];
    }

    public function identityVerification()
    {
        return $this->hasOne(\Modules\Auth\Models\IdentityVerification::class);
    }

    public function isVerifiedHost(): bool
    {
        return $this->identityVerification()->where('status', 'approved')->exists();
    }

    public function getIsVerifiedHostAttribute(): bool
    {
        return $this->isVerifiedHost();
    }

    public function hasPendingVerification(): bool
    {
        return $this->identityVerification()->where('status', 'pending')->exists();
    }

    public function getHasPendingVerificationAttribute(): bool
    {
        return $this->hasPendingVerification();
    }
}
