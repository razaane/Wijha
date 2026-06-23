'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/landing/Header';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';

export default function BrowseClient() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatConverted } = useCurrencyFormatter();
    
    // Parse the category from the URL 'type' param
    const typeParam = searchParams.get('type');
    const [activeCategory, setActiveCategory] = useState<'all' | 'stays' | 'events' | 'experiences'>(
        typeParam === 'event' ? 'events' : (typeParam === 'experience' ? 'experiences' : 'stays')
    );

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {
                // Forward all searchParams to the backend
                const endpoint = `/listings/browse?${searchParams.toString()}`;
                const res = await api.get(endpoint);
                if (res.data?.status === 'success') {
                    setListings(res.data.data.data);
                }
            } catch (err) {
                console.error('Error fetching search results', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSearchResults();
    }, [searchParams]);

    const getImageUrl = (listing: any) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    return (
        <div className="flex flex-col font-sans w-full bg-white dark:bg-[#0a0a0a] min-h-screen">
            <Header 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                isCompact={true}
                searchQuery={{
                    location: searchParams.get('location'),
                    eventName: searchParams.get('q'),
                    checkIn: searchParams.get('check_in'),
                    checkOut: searchParams.get('check_out'),
                    guests: searchParams.get('guests'),
                }}
            />
            
            <main className="flex-1 w-full px-4 md:px-8 xl:px-16 pb-16 pt-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                        {listings.length > 0 
                            ? `${listings.length} result${listings.length > 1 ? 's' : ''} found` 
                            : isLoading 
                                ? 'Searching...' 
                                : 'No results found'}
                    </h1>
                    {!isLoading && searchParams.get('location') && (
                        <p className="text-neutral-500 mt-2">
                            in {searchParams.get('location')}
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="flex flex-col gap-3 animate-pulse">
                                <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full"></div>
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mt-2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                        {listings.map((listing: any) => (
                            <Link href={`/browse/${listing.id}`} key={listing.id} className="group flex flex-col cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-3 shadow-sm group-hover:shadow-lg transition-all border border-neutral-100 dark:border-neutral-800">
                                    {getImageUrl(listing) ? (
                                        <img src={getImageUrl(listing)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                                    )}
                                    <button className="absolute top-3 right-3 p-2 text-white/80 hover:text-white hover:scale-110 transition-all z-10 drop-shadow-md">
                                        <Heart size={24} />
                                    </button>
                                    {listing.type === 'rental' && listing.rating >= 4.8 && (
                                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-900">
                                            <Star size={12} className="fill-neutral-900 text-neutral-900" />
                                            <span>Guest favorite</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col pr-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                                            {listing.type === 'rental' ? `${listing.address_city}, ${listing.address_country}` : listing.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <Star size={14} className="fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
                                            <span>{listing.rating ? Number(listing.rating).toFixed(2) : 'New'}</span>
                                        </div>
                                    </div>
                                    <p className="text-neutral-500 text-sm truncate mt-0.5">
                                        {listing.type === 'rental' ? listing.title : (listing.event_meta?.venue_name || 'Location TBA')}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="font-black text-neutral-900 dark:text-white">{formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                                        {listing.type === 'rental' && <span className="text-neutral-500 text-sm">night</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
