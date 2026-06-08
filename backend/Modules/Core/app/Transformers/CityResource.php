<?php

namespace Modules\Core\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'region' => new RegionResource($this->whenLoaded('region')),
            'cover_url' => $this->getFirstMediaUrl('cover'),
            'gallery_urls' => $this->getMedia('gallery')->map(fn($media) => $media->getUrl()),
        ];
    }
}
