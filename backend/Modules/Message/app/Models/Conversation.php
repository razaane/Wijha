<?php

namespace Modules\Message\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Message\Database\Factories\ConversationFactory;

class Conversation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['host_id', 'guest_id', 'listing_id'];

    public function host()
    {
        return $this->belongsTo(\App\Models\User::class, 'host_id');
    }

    public function guest()
    {
        return $this->belongsTo(\App\Models\User::class, 'guest_id');
    }

    public function listing()
    {
        return $this->belongsTo(\Modules\Listing\Models\Listing::class, 'listing_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // protected static function newFactory(): ConversationFactory
    // {
    //     // return ConversationFactory::new();
    // }
}
