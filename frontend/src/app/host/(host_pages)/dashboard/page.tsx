"use client";

import { useAuthStore } from '@/store/auth.store';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Plus, ArrowUpRight, Calendar, 
    MessageCircle, Star, TrendingUp, Clock, MapPin, Loader2, Compass, Camera, Trash2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import HostSelectionModal from '@/components/HostSelectionModal';

export default function HostDashboardPage() {
    const { user } = useAuthStore();
    const { formatConverted } = useCurrencyFormatter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeWorkspace, setActiveWorkspace] = useState<'all' | 'stays' | 'experiences' | 'events'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [listingToDelete, setListingToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get('/listings/me');
                if (res.data?.status === 'success') {
                    // res.data.data is the pagination object, .data is the array
                    setListings(res.data.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        setListingToDelete(id);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/listings/${listingToDelete}`);
            setListings(listings.filter(l => l.id !== listingToDelete));
            setListingToDelete(null);
        } catch (error) {
            console.error('Failed to delete listing:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Dynamic Stats
    const getStats = () => {
        const activeListingsCount = listings.filter(l => l.is_active).length;
        const nonDraftListingsCount = listings.filter(l => !l.is_draft).length;
        
        if (activeWorkspace === 'stays') {
            return [
                { label: 'Active Rentals', value: loading ? '-' : activeListingsCount.toString(), trend: `${nonDraftListingsCount} total`, isPositive: activeListingsCount > 0 },
                { label: 'Occupancy Rate', value: '0%', trend: 'Need bookings', isPositive: null },
                { label: 'Average Nightly', value: '$0', trend: 'No data yet', isPositive: null },
                { label: 'Upcoming Check-ins', value: '0', trend: 'Next 7 days', isPositive: null },
            ];
        }
        if (activeWorkspace === 'experiences') {
            return [
                { label: 'Active Tours', value: '0', trend: 'Coming soon', isPositive: null },
                { label: 'Seats Filled', value: '0', trend: 'No data', isPositive: null },
                { label: 'Upcoming Tours', value: '0', trend: 'No data', isPositive: null },
                { label: 'Review Score', value: '0.0', trend: 'No data', isPositive: null },
            ];
        }
        if (activeWorkspace === 'events') {
            return [
                { label: 'Upcoming Events', value: '0', trend: 'Coming soon', isPositive: null },
                { label: 'Tickets Sold', value: '0', trend: 'No data', isPositive: null },
                { label: 'Total Revenue', value: '$0', trend: 'No data', isPositive: null },
                { label: 'Scanning Progress', value: '0%', trend: 'No data', isPositive: null },
            ];
        }
        // Default (All)
        return [
            { label: 'Total Listings', value: loading ? '-' : nonDraftListingsCount.toString(), trend: `${activeListingsCount} Live now`, isPositive: activeListingsCount > 0 },
            { label: 'Total Earnings', value: '$0', trend: 'Waiting for first booking', isPositive: null },
            { label: 'Global Rating', value: '0.0', trend: 'Need reviews', isPositive: null },
            { label: 'Total Guests', value: '0', trend: 'Waiting for guests', isPositive: null },
        ];
    };
    
    const stats = getStats();

    const reservations: any[] = []; // Currently no reservations

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-2"
                    >
                        Welcome back, {user?.name.split(' ')[0]}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-neutral-500 dark:text-neutral-400 font-medium"
                    >
                        Here's what's happening with your {activeWorkspace === 'all' ? 'business' : activeWorkspace} today.
                    </motion.p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                        <Plus size={20} /> Create
                    </button>
                </motion.div>
            </div>

            {/* Workspace Toggle */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/50 p-1.5 rounded-full inline-flex">
                {['all', 'stays', 'experiences', 'events'].map((ws) => (
                    <button
                        key={ws}
                        onClick={() => setActiveWorkspace(ws as any)}
                        className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all ${activeWorkspace === ws ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800'}`}
                    >
                        {ws}
                    </button>
                ))}
            </div>

            {/* Filter Listings based on workspace */}
            {(() => {
                const filteredListings = activeWorkspace === 'all' 
                    ? listings 
                    : listings.filter(l => 
                        (activeWorkspace === 'stays' && l.type === 'rental') ||
                        (activeWorkspace === 'experiences' && l.type === 'tour') ||
                        (activeWorkspace === 'events' && l.type === 'event')
                    );

                return loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                    </div>
                ) : filteredListings.length === 0 ? (
                    activeWorkspace === 'experiences' ? (
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Experiences are coming soon</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 max-w-md">We are currently building out the infrastructure for you to host amazing Experiences. Stay tuned!</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Finish setting up your first listing</h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base">You're almost there! Complete your property details and start welcoming guests.</p>
                        </div>
                    </div>
                    <Link href="/host/onboarding" className="shrink-0 px-6 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition-colors shadow-sm">
                        Resume setup
                    </Link>
                </motion.div>
                )
            ) : (
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Your Listings</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
                        {filteredListings.map((listing, idx) => {
                            const photoObj = listing.photo_urls?.[0];
                            const imageUrl = getStorageUrl(photoObj?.large || photoObj?.original);

                            return (
                                <Link href={`/host/listings/${listing.id}`} key={listing.id} className="block group">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col relative"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                                        {imageUrl ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={listing.title || 'Draft Listing'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 dark:from-neutral-800 dark:via-neutral-900 dark:to-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800">
                                                <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3 shadow-sm text-neutral-400 border border-neutral-100 dark:border-neutral-700">
                                                    <Camera size={24} strokeWidth={2.5} />
                                                </div>
                                                <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">Upload photos</span>
                                            </div>
                                        )}
                                        {listing.is_draft ? (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-900 shadow-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Draft
                                            </div>
                                        ) : listing.is_active ? (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-900 shadow-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                                            </div>
                                        ) : (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-900 shadow-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Paused
                                            </div>
                                        )}

                                        {/* Delete Button */}
                                        <button 
                                            onClick={(e) => handleDeleteClick(e, listing.id)}
                                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1 truncate">{listing.title || 'Untitled Draft'}</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-4 truncate">
                                            <MapPin size={14} className="flex-shrink-0" /> 
                                            <span className="truncate">
                                                {listing.address_city ? `${listing.address_city}, ` : ''}
                                                {listing.address_country || 'Location not set'}
                                            </span>
                                        </p>
                                        <div className="flex items-center justify-between">
                                            {listing.type === 'event' ? (
                                                <span className="font-black text-neutral-900 dark:text-white">Tickets <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Available</span></span>
                                            ) : listing.price ? (
                                                <span className="font-black text-neutral-900 dark:text-white">{formatConverted(listing.price, listing.currency || 'USD')} <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{listing.type === 'tour' ? '/ person' : '/ night'}</span></span>
                                            ) : (
                                                <span className="font-bold text-neutral-400 dark:text-neutral-500 text-sm">Price not set</span>
                                            )}
                                            <div className="text-sm font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-white transition-colors px-3 py-1.5 rounded-lg ml-auto">
                                                {listing.is_draft ? 'Continue' : 'Manage'}
                                            </div>
                                        </div>
                                    </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            );
            })()}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <h4 className="text-neutral-500 dark:text-neutral-400 text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</h4>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{stat.value}</span>
                            {stat.isPositive !== null && (
                                <span className={`flex items-center text-sm font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                    {stat.isPositive && <TrendingUp size={16} className="mr-1" />}
                                    {stat.trend}
                                </span>
                            )}
                            {stat.isPositive === null && (
                                <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">{stat.trend}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
                
                {/* Upcoming Reservations */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Upcoming Reservations</h2>
                        <Link href="/host/calendar" className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                            Go to Calendar <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 border-dashed border-2 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No upcoming guests</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">When guests book your properties, their reservation details will appear right here.</p>
                        <Link href="/host/calendar" className="px-6 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                            Manage availability
                        </Link>
                    </div>
                </div>

                {/* Inbox Overview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Recent Messages</h2>
                        <Link href="/host/inbox" className="text-sm font-bold text-amber-500 hover:text-amber-600">
                            Inbox
                        </Link>
                    </div>
                    
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 border-dashed border-2 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">You're all caught up</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Guest inquiries and booking requests will show up here.</p>
                    </div>
                </div>
            </div>

            {/* Create Selection Modal */}
            <HostSelectionModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {listingToDelete !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isDeleting && setListingToDelete(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-100 dark:border-neutral-800 relative overflow-hidden"
                        >
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">Delete Listing?</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium">Are you sure you want to permanently delete this listing? All associated data will be lost. This action cannot be undone.</p>
                            
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => setListingToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 px-4 rounded-xl font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
