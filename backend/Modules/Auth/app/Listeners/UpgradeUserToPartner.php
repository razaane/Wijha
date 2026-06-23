<?php

namespace Modules\Auth\Listeners;

use App\Models\User;
use Modules\Listing\Events\ListingCreated;

/**
 * When a listing is created, upgrade the user to 'partner' role
 * if they aren't already a partner or admin.
 *
 * This keeps role management inside the Auth module where it belongs.
 */
class UpgradeUserToPartner
{
    public function handle(ListingCreated $event): void
    {
        $user = $event->listing->user;

        if ($user->role !== User::ROLE_PARTNER && $user->role !== User::ROLE_ADMIN) {
            $user->role = User::ROLE_PARTNER;
            $user->save();
        }
    }
}
