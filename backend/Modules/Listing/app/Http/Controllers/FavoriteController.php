<?php

namespace Modules\Listing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Listing\Models\Listing;
use Modules\Listing\Models\Favorite;

class FavoriteController extends Controller
{
    /**
     * Get all favorited listings for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Fetch listings that the user has favorited
        $listings = Listing::whereHas('favoritedBy', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['user', 'eventMeta']) // Eager load necessary relations
        ->get();

        // Append photo urls
        $listings->each(function ($listing) {
            $listing->append('photo_urls');
        });

        return response()->json([
            'status' => 'success',
            'data' => $listings
        ]);
    }

    /**
     * Get an array of favorited listing IDs for the authenticated user.
     */
    public function ids(Request $request)
    {
        $user = $request->user();
        
        $favoriteIds = Favorite::where('user_id', $user->id)
            ->pluck('listing_id')
            ->toArray();

        return response()->json([
            'status' => 'success',
            'data' => $favoriteIds
        ]);
    }

    /**
     * Toggle favorite status for a given listing.
     */
    public function toggle(Request $request, $id)
    {
        $user = $request->user();
        $listing = Listing::findOrFail($id);

        $favorite = Favorite::where('user_id', $user->id)
            ->where('listing_id', $listing->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $isFavorited = false;
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'listing_id' => $listing->id
            ]);
            $isFavorited = true;
        }

        return response()->json([
            'status' => 'success',
            'is_favorited' => $isFavorited,
            'message' => $isFavorited ? 'Listing added to favorites' : 'Listing removed from favorites'
        ]);
    }
}
