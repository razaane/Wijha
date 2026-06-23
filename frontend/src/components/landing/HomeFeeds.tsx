'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import Link from 'next/link';
import { Star, Heart, ArrowRight, CreditCard, Map, Hotel } from 'lucide-react';

export default function HomeFeeds() {
    const [popularStays, setPopularStays] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const { formatConverted } = useCurrencyFormatter();

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const staysRes = await api.get('/listings/browse?type=rental');
                if (staysRes.data?.status === 'success') {
                    setPopularStays(staysRes.data.data.data.slice(0, 10)); // Top 10
                }

                const eventsRes = await api.get('/listings/browse?type=event');
                if (eventsRes.data?.status === 'success') {
                    setUpcomingEvents(eventsRes.data.data.data.slice(0, 10));
                }
            } catch (err) {
                console.error('Error fetching feeds', err);
            }
        };
        fetchFeeds();
    }, []);

    const getImageUrl = (listing: any) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    return (
        <div className="w-full bg-white dark:bg-[#0a0a0a] py-16">
            <div className="w-full px-4 md:px-8 xl:px-16 space-y-16">
                
                {/* POPULAR STAYS FEED */}
                <section>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Popular Stays</h2>
                            <p className="text-neutral-500 text-sm font-medium mt-1">Highly rated homes right now</p>
                        </div>
                        <Link href="/browse?type=rental" className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                            See all <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="flex gap-6 overflow-x-auto snap-x hide-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                        {popularStays.length > 0 ? popularStays.map((listing: any) => (
                            <Link href={`/browse/${listing.id}`} key={listing.id} className="min-w-[280px] sm:min-w-[340px] max-w-[380px] snap-start group flex flex-col cursor-pointer shrink-0">
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-4 shadow-sm group-hover:shadow-xl transition-all border border-neutral-100 dark:border-neutral-800">
                                    {getImageUrl(listing) ? (
                                        <img src={getImageUrl(listing)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                                    )}
                                    <button className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:scale-110 transition-all z-10 drop-shadow-md">
                                        <Heart size={24} />
                                    </button>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="pr-4">
                                        <h3 className="font-bold text-neutral-900 dark:text-white truncate">{listing.address_city}, {listing.address_country}</h3>
                                        <p className="text-neutral-500 text-sm truncate max-w-[200px]">{listing.title}</p>
                                        <div className="mt-1 flex items-baseline gap-1">
                                            <span className="font-black text-neutral-900 dark:text-white">{formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                                            <span className="text-neutral-500 text-sm">night</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold bg-white dark:bg-neutral-800 px-2 py-1 rounded-full shadow-sm border border-neutral-100 dark:border-neutral-700">
                                        <Star size={12} className="fill-amber-500 text-amber-500" />
                                        <span>New</span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="w-full text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                                <p className="text-neutral-500 font-medium">No stays found.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* UPCOMING EVENTS FEED */}
                <section>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Upcoming Events</h2>
                            <p className="text-neutral-500 text-sm font-medium mt-1">Concerts, workshops, and more</p>
                        </div>
                        <Link href="/browse?type=event" className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                            See all <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="flex gap-6 overflow-x-auto snap-x hide-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                        {upcomingEvents.length > 0 ? upcomingEvents.map((listing: any) => (
                            <Link href={`/browse/${listing.id}`} key={listing.id} className="min-w-[280px] sm:min-w-[340px] max-w-[380px] snap-start group flex flex-col cursor-pointer shrink-0">
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-4 shadow-sm group-hover:shadow-xl transition-all border border-neutral-100 dark:border-neutral-800">
                                    {getImageUrl(listing) ? (
                                        <img src={getImageUrl(listing)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                                    )}
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="pr-4">
                                        <h3 className="font-bold text-neutral-900 dark:text-white truncate">{listing.title}</h3>
                                        <p className="text-neutral-500 text-sm truncate max-w-[200px]">{listing.event_meta?.venue_name || 'Location TBA'}</p>
                                        <div className="mt-1 flex items-baseline gap-1">
                                            <span className="font-black text-amber-500">From {formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="w-full text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                                <p className="text-neutral-500 font-medium">No upcoming events found.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* WHY WIJHA */}
                <section className="pt-8 pb-16">
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Why book with Wijha?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-6">
                                <CreditCard size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Secure Payments</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Book with confidence using our 100% secure payment gateway and flexible cancellation policies.</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-6">
                                <Map size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Local Experiences</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Discover hidden gems and authentic experiences curated by verified local guides.</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-6">
                                <Hotel size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Premium Stays</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Choose from over 10,000 handpicked villas, riads, and luxury apartments.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
