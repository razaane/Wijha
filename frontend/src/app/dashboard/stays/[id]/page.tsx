'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { Star, Share, Heart, MapPin, ChevronLeft, Loader2, Users, Bed, Bath, DoorOpen, Shield, Wifi, Tv, Snowflake, Coffee, Car } from 'lucide-react';
import Link from 'next/link';

export default function StayDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { formatConverted } = useCurrencyFormatter();

    useEffect(() => {
        if (!id) return;
        const fetchListing = async () => {
            try {
                const res = await api.get(`/listings/public/${id}`);
                if (res.data?.status === 'success') {
                    setListing(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch listing', err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Stay not found</h2>
                <button onClick={() => router.push('/dashboard/stays')} className="px-6 py-2 bg-amber-500 text-white font-bold rounded-full">
                    Back to Stays
                </button>
            </div>
        );
    }

    const photos = listing.photo_urls || [];
    const mainPhoto = photos[0]?.original ? getStorageUrl(photos[0].original) : null;
    const gridPhotos = photos.slice(1, 5).map((p: any) => getStorageUrl(p.original));

    // Fill grid photos with empty strings if less than 4 to keep layout
    while (gridPhotos.length < 4) {
        gridPhotos.push('');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pb-32">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg transition-colors -ml-3">
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-bold underline hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg transition-colors">
                        <Share size={16} /> Share
                    </button>
                    <button className="flex items-center gap-2 text-sm font-bold underline hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg transition-colors">
                        <Heart size={16} /> Save
                    </button>
                </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white mb-2">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-6">
                <div className="flex items-center gap-1">
                    <Star size={16} className="fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
                    <span className="font-bold text-neutral-900 dark:text-white">New</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span className="underline font-bold cursor-pointer">{listing.address_city}, {listing.address_province}, {listing.address_country}</span>
            </div>

            {/* Photo Gallery Grid */}
            <div className="rounded-2xl overflow-hidden mb-12 bg-neutral-100 dark:bg-neutral-800">
                {mainPhoto ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[500px]">
                        <div className="h-full w-full cursor-pointer hover:opacity-90 transition-opacity">
                            <img src={mainPhoto} alt="Main" className="w-full h-full object-cover" />
                        </div>
                        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
                            {gridPhotos.map((photo: string, idx: number) => (
                                <div key={idx} className="h-full w-full bg-neutral-200 dark:bg-neutral-700 cursor-pointer hover:opacity-90 transition-opacity">
                                    {photo && <img src={photo} alt={`Grid ${idx}`} className="w-full h-full object-cover" />}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[400px] flex items-center justify-center text-neutral-400">
                        No photos available
                    </div>
                )}
            </div>

            {/* Main Content & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8 divide-y divide-neutral-200 dark:divide-neutral-800">
                    
                    {/* Host & Basics */}
                    <div className="pb-8 flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                Hosted by {listing.user?.name}
                            </h2>
                            <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                                <span className="flex items-center gap-1"><Users size={18} /> {listing.guests_count || 1} guests</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><DoorOpen size={18} /> {listing.bedrooms_count || 1} bedrooms</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Bed size={18} /> {listing.beds_count || 1} beds</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Bath size={18} /> {listing.bathrooms_count || 1} baths</span>
                            </div>
                        </div>
                        {listing.user?.avatar ? (
                            <img src={getStorageUrl(listing.user.avatar)} alt="Host" className="w-14 h-14 rounded-full object-cover shadow-sm border border-neutral-100 dark:border-neutral-800" />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xl font-bold">
                                {listing.user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Highlights */}
                    <div className="py-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <Shield size={28} className="text-neutral-900 dark:text-white" />
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Wijha Guarantee</h3>
                                <p className="text-neutral-500 text-sm">Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues.</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="py-8">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">About this space</h2>
                        <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {listing.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Amenities */}
                    {listing.amenities && listing.amenities.length > 0 && (
                        <div className="py-8">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">What this place offers</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {listing.amenities.slice(0, 10).map((amenity: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                                        <div className="w-6 h-6 flex items-center justify-center opacity-70">
                                            {amenity.toLowerCase().includes('wifi') ? <Wifi size={20} /> :
                                             amenity.toLowerCase().includes('tv') ? <Tv size={20} /> :
                                             amenity.toLowerCase().includes('air conditioning') ? <Snowflake size={20} /> :
                                             amenity.toLowerCase().includes('kitchen') ? <Coffee size={20} /> :
                                             amenity.toLowerCase().includes('parking') ? <Car size={20} /> :
                                             <div className="w-2 h-2 rounded-full bg-current" />}
                                        </div>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                            {listing.amenities.length > 10 && (
                                <button className="mt-6 px-6 py-3 border border-neutral-900 dark:border-white rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    Show all {listing.amenities.length} amenities
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Sticky Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                            <span className="text-neutral-500 font-medium">night</span>
                        </div>

                        {/* Mock Date & Guest Picker */}
                        <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl mb-4 overflow-hidden divide-y divide-neutral-300 dark:divide-neutral-700">
                            <div className="flex divide-x divide-neutral-300 dark:divide-neutral-700">
                                <div className="p-3 flex-1 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Check-in</p>
                                    <p className="text-sm text-neutral-500">Add date</p>
                                </div>
                                <div className="p-3 flex-1 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Checkout</p>
                                    <p className="text-sm text-neutral-500">Add date</p>
                                </div>
                            </div>
                            <div className="p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Guests</p>
                                    <p className="text-sm text-neutral-500">1 guest</p>
                                </div>
                                <ChevronLeft size={16} className="-rotate-90 text-neutral-500" />
                            </div>
                        </div>

                        <button className="w-full py-3.5 bg-gradient-to-r from-[#FF385C] to-[#D70466] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity">
                            Reserve
                        </button>
                        
                        <p className="text-center text-sm text-neutral-500 mt-4">You won't be charged yet</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
