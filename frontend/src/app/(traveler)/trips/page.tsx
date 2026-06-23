'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket, ArrowRight, Loader2, Home } from 'lucide-react';
import { getStorageUrl } from '@/lib/url';

export default function MyTripsPage() {
    const { token, isAuthenticated } = useAuthStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings');
                if (res.data?.status === 'success') {
                    setBookings(res.data.data.data || res.data.data); // Handle pagination structure if exists
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated, token]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a]">
                <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
            </div>
        );
    }

    const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] pb-24 font-sans selection:bg-amber-500/30 transition-colors duration-300 pt-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">My Trips</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">Manage your upcoming rentals and event tickets.</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                            <MapPin size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No trips booked... yet!</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">Time to dust off your bags and start planning your next great adventure.</p>
                        <Link href="/" className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-full font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors">
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {upcomingBookings.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Upcoming</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcomingBookings.map((booking, idx) => (
                                        <BookingCard key={booking.id} booking={booking} index={idx} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {pastBookings.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Past Trips</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75 grayscale-[0.3]">
                                    {pastBookings.map((booking, idx) => (
                                        <BookingCard key={booking.id} booking={booking} index={idx} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, index }: { booking: any, index: number }) {
    const isEvent = booking.listing?.type === 'event';
    const photoUrl = booking.listing?.photo_urls?.[0]?.thumb || booking.listing?.photo_urls?.[0]?.original;
    const coverUrl = photoUrl ? getStorageUrl(photoUrl) : 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=400&auto=format&fit=crop';

    const getDisplayDate = () => {
        if (isEvent && booking.listing?.event_meta?.start_datetime) {
            return format(new Date(booking.listing.event_meta.start_datetime), 'MMM d, yyyy • h:mm a');
        }
        if (booking.check_in && booking.check_out) {
            return `${format(new Date(booking.check_in), 'MMM d')} - ${format(new Date(booking.check_out), 'MMM d, yyyy')}`;
        }
        return 'Date TBA';
    };

    const getLink = () => {
        if (isEvent) return `/trips/${booking.id}/ticket`;
        return `/listings/${booking.listing?.id}`; // Direct to listing details for rentals
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={coverUrl} 
                    alt={booking.listing?.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    {isEvent ? <Ticket size={14} className="text-amber-500" /> : <Home size={14} className="text-emerald-500" />}
                    <span className="text-neutral-900 dark:text-white uppercase tracking-wider">{isEvent ? 'Event' : 'Rental'}</span>
                </div>
                {booking.status === 'pending' && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                        Pending
                    </div>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">{booking.listing?.title}</h3>
                
                <div className="space-y-2 mb-6 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{getDisplayDate()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="truncate">{booking.listing?.address_city || booking.listing?.address_country || 'Location TBA'}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white">
                        {booking.payment?.currency} {parseFloat(booking.payment?.amount || 0).toFixed(2)}
                    </span>
                    <Link 
                        href={getLink()} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${isEvent ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'}`}
                    >
                        {isEvent ? 'View Ticket' : 'View Details'}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
