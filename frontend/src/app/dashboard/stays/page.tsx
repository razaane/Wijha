'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import Link from 'next/link';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { MapPin, Star, Heart, Filter, Loader2 } from 'lucide-react';

export default function StaysPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { formatConverted } = useCurrencyFormatter();

    useEffect(() => {
        const fetchStays = async () => {
            try {
                const res = await api.get('/listings/browse?type=rental');
                if (res.data?.status === 'success') {
                    setListings(res.data.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch stays', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStays();
    }, []);

    const getImageUrl = (listing: any) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            {/* Header & Filters */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Premium Stays</h1>
                    <p className="text-neutral-500 font-medium mt-1">Find your perfect home away from home.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-bold text-sm">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Grid */}
            {listings.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No stays found</h3>
                    <p className="text-neutral-500">Try adjusting your filters or search area.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {listings.map((listing: any) => (
                        <Link href={`/dashboard/stays/${listing.id}`} key={listing.id} className="group flex flex-col">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                                {getImageUrl(listing) ? (
                                    <img 
                                        src={getImageUrl(listing)} 
                                        alt={listing.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
                                )}
                                <button className="absolute top-3 right-3 p-2 text-white/80 hover:text-white hover:scale-110 transition-all z-10" onClick={(e) => { e.preventDefault(); /* Wishlist feature coming soon */ }}>
                                    <Heart size={24} />
                                </button>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-bold text-neutral-900 shadow-sm">
                                    Guest Favorite
                                </div>
                            </div>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">{listing.address_city}, {listing.address_country}</h3>
                                    <p className="text-neutral-500 text-sm truncate">{listing.title}</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="font-bold text-neutral-900 dark:text-white">{formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                                        <span className="text-neutral-500 text-sm">night</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <Star size={14} className="fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
                                    <span>New</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
