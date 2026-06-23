'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Calendar, Clock, Ticket as TicketIcon, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketPage({ params }: { params: { id: string } }) {
    const { token, isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchTicket = async () => {
            try {
                const res = await api.get(`/bookings/${params.id}`);
                if (res.data?.status === 'success') {
                    setBooking(res.data.data);
                } else {
                    router.push('/trips');
                }
            } catch (error) {
                console.error('Failed to fetch ticket:', error);
                router.push('/trips');
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [isAuthenticated, token, params.id, router]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900">
                <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
            </div>
        );
    }

    if (!booking || booking.listing?.type !== 'event') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                <p>Invalid ticket or not an event.</p>
                <button onClick={() => router.push('/trips')} className="mt-4 text-amber-500 hover:underline">Return to Trips</button>
            </div>
        );
    }

    const listing = booking.listing;
    const eventMeta = listing.event_meta || {};
    const ticketDetails = booking.ticket || {};
    
    const startDate = eventMeta.start_datetime ? new Date(eventMeta.start_datetime) : null;
    const endDate = eventMeta.end_datetime ? new Date(eventMeta.end_datetime) : null;

    // Unique secure hash for the QR code
    const qrData = JSON.stringify({
        booking_id: booking.id,
        user_id: user?.id,
        ticket_code: `WJ-${booking.id}-${user?.id}`
    });

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-200">
            {/* Header */}
            <header className="p-6 flex items-center justify-between">
                <button 
                    onClick={() => router.push('/trips')}
                    className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors"
                >
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <button className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-full font-bold text-sm text-white hover:bg-neutral-800 transition-colors">
                    <Download size={16} />
                    Save as PDF
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 pb-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-md"
                >
                    {/* TOP HALF OF TICKET */}
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-t-[2rem] p-8 relative overflow-hidden shadow-2xl border-t border-x border-neutral-700/50">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                        
                        {/* Background subtle pattern */}
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/20 uppercase tracking-widest inline-flex items-center gap-1.5">
                                    <TicketIcon size={12} />
                                    {ticketDetails.name || 'General Admission'}
                                </div>
                                {booking.status === 'confirmed' && (
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                                        <CheckCircle2 size={16} />
                                        Confirmed
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                                {listing.title}
                            </h1>
                            
                            <div className="space-y-4 mt-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-700/50">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Date</p>
                                        <p className="text-white font-medium">{startDate ? format(startDate, 'EEEE, MMMM d, yyyy') : 'TBA'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-700/50">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Time</p>
                                        <p className="text-white font-medium">
                                            {startDate ? format(startDate, 'h:mm a') : 'TBA'}
                                            {endDate && ` - ${format(endDate, 'h:mm a')}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-700/50">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Venue</p>
                                        <p className="text-white font-medium">{eventMeta.venue_name || listing.address_city || 'TBA'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TICKET DIVIDER (Perforated Edge) */}
                    <div className="relative h-8 bg-gradient-to-br from-neutral-800 to-neutral-900 border-x border-neutral-700/50 flex items-center">
                        <div className="absolute left-[-16px] w-8 h-8 bg-neutral-950 rounded-full" />
                        <div className="flex-1 border-t-2 border-dashed border-neutral-700 mx-6 opacity-50" />
                        <div className="absolute right-[-16px] w-8 h-8 bg-neutral-950 rounded-full" />
                    </div>

                    {/* BOTTOM HALF OF TICKET (QR Code & Guest Info) */}
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-b-[2rem] p-8 border-b border-x border-neutral-700/50">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Guest Name</p>
                                <p className="text-white font-bold truncate">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Booking ID</p>
                                <p className="text-white font-bold truncate">#{booking.id.toString().padStart(6, '0')}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-3xl shadow-xl mb-4">
                                <QRCodeSVG 
                                    value={qrData} 
                                    size={180}
                                    level="Q"
                                    includeMargin={false}
                                    fgColor="#0a0a0a"
                                    bgColor="#ffffff"
                                />
                            </div>
                            <p className="text-neutral-500 text-sm font-medium">Scan this code at the entrance</p>
                        </div>
                    </div>
                </motion.div>
            </main>
            
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
