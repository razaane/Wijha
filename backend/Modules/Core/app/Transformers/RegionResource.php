<?php

namespace Modules\Core\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name, // Returns translated name based on app locale
            'slug' => $this->slug,
            'description' => $this->description,
            'cover_url' => $this->getFirstMediaUrl('cover'),
        ];
    }
}
