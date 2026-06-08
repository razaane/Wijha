<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Country extends Model
{
    use HasTranslations;

    protected $fillable = ['name', 'iso_code', 'currency_code'];

    public $translatable = ['name'];

    public function regions(): HasMany
    {
        return $this->hasMany(Region::class);
    }
}
