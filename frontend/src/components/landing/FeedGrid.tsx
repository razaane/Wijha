'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Category } from './LandingClient';
import { useAuthStore } from '@/store/auth.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { toggleFavorite } from '@/lib/favorites.api';

interface FeedGridProps {
    activeCategory: Category;
}

export default function FeedGrid({ activeCategory }: FeedGridProps) {
    const [staysListings, setStaysListings] = useState([]);
    const [eventsListings, setEventsListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatConverted } = useCurrencyFormatter();
    
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { hasFavorite, addFavorite, removeFavorite } = useFavoriteStore();

    const handleToggleFavorite = async (e: React.MouseEvent, listingId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please login to save favorites.');
            return;
        }

        const isFav = hasFavorite(listingId);
        
        // Optimistic update
        if (isFav) {
            removeFavorite(listingId);
        } else {
            addFavorite(listingId);
        }

        try {
            await toggleFavorite(listingId);
        } catch (error) {
            if (isFav) {
                addFavorite(listingId);
            } else {
                removeFavorite(listingId);
            }
            console.error('Failed to toggle favorite', error);
        }
    };

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                if (activeCategory === 'all') {
                    const [staysRes, eventsRes] = await Promise.all([
                        api.get('/listings/browse?type=rental'),
                        api.get('/listings/browse?type=event')
                    ]);
                    setStaysListings(staysRes.data?.data?.data?.slice(0, 10) || []);
                    setEventsListings(eventsRes.data?.data?.data?.slice(0, 10) || []);
                } else {
                    let endpoint = '/listings/browse';
                    if (activeCategory === 'stays') {
                        endpoint += '?type=rental';
                    } else if (activeCategory === 'experiences' || activeCategory === 'events') {
                        endpoint += '?type=event';
                    }

                    const res = await api.get(endpoint);
                    if (res.data?.status === 'success') {
                        if (activeCategory === 'stays') {
                            setStaysListings(res.data.data.data);
                            setEventsListings([]);
                        } else {
                            setEventsListings(res.data.data.data);
                            setStaysListings([]);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching grid feeds', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, [activeCategory]);

    const getImageUrl = (listing: any) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    const renderGrid = (listings: any[], categoryHint: 'stays' | 'events') => {
        if (!listings || listings.length === 0) return null;
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                {listings.map((listing: any) => (
                    <Link href={`/browse/${listing.id}`} key={listing.id} className="group flex flex-col cursor-pointer">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-3 shadow-sm group-hover:shadow-lg transition-all border border-neutral-100 dark:border-neutral-800">
                            {getImageUrl(listing) ? (
                                <img src={getImageUrl(listing)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                            )}
                            <button 
                                onClick={(e) => handleToggleFavorite(e, listing.id)}
                                className="absolute top-3 right-3 p-2 text-white/80 hover:text-white hover:scale-110 transition-all z-10 drop-shadow-md"
                            >
                                <Heart size={24} className={hasFavorite(listing.id) ? 'fill-rose-500 text-rose-500' : ''} />
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
        );
    };

    return (
        <div className="w-full px-4 md:px-8 xl:px-16 pb-16 pt-4 bg-white dark:bg-[#0a0a0a]">
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
                <div className="flex flex-col gap-12">
                    
                    {/* ALL CATEGORY VIEW */}
                    {activeCategory === 'all' && (
                        <>
                            {staysListings.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 tracking-tight">Popular Stays</h2>
                                    {renderGrid(staysListings, 'stays')}
                                </div>
                            )}
                            
                            {eventsListings.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 tracking-tight">Upcoming Events & Experiences</h2>
                                    {renderGrid(eventsListings, 'events')}
                                </div>
                            )}

                            {staysListings.length === 0 && eventsListings.length === 0 && (
                                <div className="w-full text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-neutral-500 font-medium">No listings found.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* SPECIFIC CATEGORY VIEW */}
                    {activeCategory !== 'all' && (
                        <>
                            {activeCategory === 'stays' && staysListings.length > 0 ? (
                                renderGrid(staysListings, 'stays')
                            ) : (activeCategory === 'events' || activeCategory === 'experiences') && eventsListings.length > 0 ? (
                                renderGrid(eventsListings, 'events')
                            ) : (
                                <div className="w-full text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-neutral-500 font-medium">No listings found for this category.</p>
                                </div>
                            )}
                        </>
                    )}

                </div>
            )}
        </div>
    );
}
