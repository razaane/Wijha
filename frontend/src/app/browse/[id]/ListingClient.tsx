'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import Header from '@/components/landing/Header';
import { Category } from '@/components/landing/LandingClient';
import { Star, Heart, Share, MapPin, Check, Grid, Navigation } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function ListingClient({ id }: { id: string }) {
    const [listing, setListing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<Category>('stays');
    const { formatConverted } = useCurrencyFormatter();

    useEffect(() => {
        const fetchListing = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/listings/public/${id}`);
                if (res.data?.status === 'success') {
                    setListing(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching listing details', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
                <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
                <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <h1 className="text-3xl font-bold">Listing not found</h1>
                    <p className="text-neutral-500">The property you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    // Default dates for the widget mock
    const defaultCheckIn = new Date();
    const defaultCheckOut = new Date();
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 5);
    const nights = differenceInDays(defaultCheckOut, defaultCheckIn);
    
    // Fallback photos logic
    const photos = listing.photo_urls || [];
    const getPhoto = (index: number) => {
        return photos[index]?.original ? getStorageUrl(photos[index].original) : 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans pb-24">
            <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} />
            
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{listing.title}</h1>
                        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                            <Star size={14} className="text-neutral-900 dark:text-white fill-current mr-1" />
                            <span className="text-neutral-900 dark:text-white mr-1">{listing.rating || 'New'}</span>
                            <span className="mx-2">·</span>
                            <span className="underline decoration-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
                                {listing.address_city}, {listing.address_state ? `${listing.address_state}, ` : ''}{listing.address_country}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm">
                            <Share size={16} /> Share
                        </button>
                        <button className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm">
                            <Heart size={16} /> Save
                        </button>
                    </div>
                </div>

                {/* Cinematic Photo Grid */}
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] mb-12 rounded-2xl overflow-hidden relative">
                    <div className="col-span-4 md:col-span-2 row-span-2 h-full cursor-pointer relative group overflow-hidden">
                        <img src={getPhoto(0)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Main" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden">
                        <img src={getPhoto(1)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 1" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden">
                        <img src={getPhoto(2)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 2" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden">
                        <img src={getPhoto(3)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 3" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    </div>
                    <div className="hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden">
                        <img src={getPhoto(4)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 4" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <button className="absolute bottom-4 right-4 bg-white dark:bg-neutral-900 px-4 py-1.5 rounded-lg border border-neutral-900 dark:border-neutral-100 text-sm font-bold flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10 shadow-sm">
                            <Grid size={16} /> Show all photos
                        </button>
                    </div>
                </div>

                {/* Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-start pb-6 border-b border-neutral-200 dark:border-neutral-800">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold mb-1">
                                    Entire {listing.property_type || 'rental unit'} hosted by {listing.user?.name}
                                </h2>
                                <ol className="flex flex-wrap text-neutral-600 dark:text-neutral-400 text-base gap-x-1">
                                    <li>{listing.guests_count} guests</li>
                                    <span>·</span>
                                    <li>{listing.bedrooms_count} bedrooms</li>
                                    <span>·</span>
                                    <li>{listing.beds_count} beds</li>
                                    <span>·</span>
                                    <li>{listing.bathrooms_count} baths</li>
                                </ol>
                            </div>
                            <div className="pl-4">
                                <img 
                                    src={listing.user?.avatar ? getStorageUrl(listing.user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.user?.name || 'User'}`} 
                                    className="w-14 h-14 rounded-full object-cover shadow-sm bg-neutral-100" 
                                    alt={listing.user?.name}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line text-lg font-light">
                                {listing.description}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold mb-6">What this place offers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                                {listing.amenities && listing.amenities.length > 0 ? (
                                    listing.amenities.map((amenity: string) => (
                                        <div key={amenity} className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300">
                                            <Check size={24} className="text-neutral-400" />
                                            <span className="capitalize text-lg font-light">{amenity.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-neutral-500 col-span-2">No amenities listed</div>
                                )}
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="py-8">
                            <h2 className="text-2xl font-bold mb-6">Where you'll be</h2>
                            <div className="w-full h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center flex-col text-neutral-500 relative overflow-hidden">
                                <MapPin size={48} className="mb-4 text-neutral-400" />
                                <span className="font-medium text-lg">{listing.address_city}, {listing.address_country}</span>
                                <span className="text-sm">Exact location provided after booking</span>
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-28 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl bg-white dark:bg-[#1a1a1a]">
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">{formatConverted(listing.price, listing.currency)}</span>
                                <span className="text-neutral-500 font-medium">night</span>
                            </div>

                            <div className="border border-neutral-300 dark:border-neutral-600 rounded-xl mb-4 overflow-hidden">
                                <div className="grid grid-cols-2 border-b border-neutral-300 dark:border-neutral-600">
                                    <div className="p-3 border-r border-neutral-300 dark:border-neutral-600 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Check-in</div>
                                        <div className="text-sm text-neutral-500">{format(defaultCheckIn, 'M/d/yyyy')}</div>
                                    </div>
                                    <div className="p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Check-out</div>
                                        <div className="text-sm text-neutral-500">{format(defaultCheckOut, 'M/d/yyyy')}</div>
                                    </div>
                                </div>
                                <div className="p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Guests</div>
                                    <div className="text-sm text-neutral-500">1 guest</div>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-lg transition-all text-lg mb-4 shadow-md">
                                Reserve
                            </button>
                            <div className="text-center text-neutral-500 text-sm mb-6">You won't be charged yet</div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">{formatConverted(listing.price, listing.currency)} x {nights} nights</span>
                                    <span>{formatConverted(listing.price * nights, listing.currency)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">Cleaning fee</span>
                                    <span>{formatConverted(50, listing.currency)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">Service fee</span>
                                    <span>{formatConverted(100, listing.currency)}</span>
                                </div>
                                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex justify-between font-bold text-lg text-neutral-900 dark:text-white">
                                    <span>Total</span>
                                    <span>{formatConverted(listing.price * nights + 150, listing.currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
