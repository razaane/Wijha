<?php

namespace Modules\Listing\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Modules\Listing\Models\Listing;

/**
 * Fired when a new listing is created.
 * Other modules (e.g. Auth) can listen to this to perform side-effects.
 */
class ListingCreated
{
    use Dispatchable;

    public function __construct(
        public Listing $listing
    ) {}
}
