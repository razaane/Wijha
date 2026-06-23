"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import Link from 'next/link';
import { Plus, MapPin, MoreVertical, Home, Star, LayoutGrid, List, Loader2, ArrowRight, Ticket, Map as MapIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HostSelectionModal from '@/components/HostSelectionModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface Listing {
    id: number;
    title: string;
    type: string;
    property_type: string;
    address_city: string;
    address_country: string;
    price: number;
    is_active: boolean;
    is_draft: boolean;
    photo_urls: { small: string, original: string }[];
    currency?: string;
}

export default function ListingsPage() {
    const { formatConverted } = useCurrencyFormatter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'rental' | 'tour' | 'event'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const filteredListings = listings.filter(l => filter === 'all' || l.type === filter);

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

    const getImageUrl = (listing: Listing) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    const getStatusBadge = (listing: Listing) => {
        if (listing.is_draft) {
            return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Draft</span>;
        }
        if (listing.is_active) {
            return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Active</span>;
        }
        return <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold border border-neutral-200">Offline</span>;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
                <p className="text-neutral-500 font-medium">Loading your portfolio...</p>
            </div>
        );
    }

    const options = [
        {
            id: 'stay',
            title: 'Host a Stay',
            description: 'Earn money sharing your extra space, riad, or apartment with travelers.',
            icon: Home,
            bg: 'bg-amber-500',
            image: '/images/host_stay.png'
        },
        {
            id: 'experience',
            title: 'Host an Experience',
            description: 'Lead local tours, cooking classes, or unique cultural adventures.',
            icon: MapIcon,
            bg: 'bg-emerald-500',
            image: '/images/host_experience.png'
        },
        {
            id: 'event',
            title: 'Organize an Event',
            description: 'Sell tickets for concerts, workshops, festivals, and exclusive gatherings.',
            icon: Ticket,
            bg: 'bg-blue-500',
            image: '/images/host_event.png'
        }
    ];

    if (listings.length === 0) {
        return (
            <div className="w-full flex flex-col items-center py-8">
                <div className="text-center mb-10">
                    <h2 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-4 tracking-tight">What would you like to host?</h2>
                    <p className="text-neutral-500 text-lg max-w-2xl mx-auto">Join thousands of hosts earning money by sharing their spaces, experiences, and events on Wijha.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                    {options.map((option, idx) => (
                        <div
                            key={option.id}
                            onClick={() => router.push(`/host/onboarding?type=${option.id}`)}
                            className="group relative rounded-[32px] overflow-hidden cursor-pointer min-h-[400px] sm:min-h-[500px] shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full">
                                <Image 
                                    src={option.image} 
                                    alt={option.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                            
                            {/* Colored Glow on Hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${option.bg} mix-blend-overlay`} />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/30 text-white`}>
                                        <option.icon size={28} />
                                    </div>
                                    
                                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
                                        {option.title}
                                    </h3>
                                    
                                    <p className="text-white/80 text-base leading-relaxed mb-6 font-medium">
                                        {option.description}
                                    </p>
                                    
                                    <div className="flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="bg-white text-neutral-900 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                                            Get started <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Filter Tabs */}
            <div className="mb-10 inline-flex items-center bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-full border border-neutral-100 dark:border-neutral-800 shadow-sm">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'rental', label: 'Stays' },
                    { id: 'tour', label: 'Experiences' },
                    { id: 'event', label: 'Events' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === tab.id ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">Your Listings</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Manage your properties, availability, and settings.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* View Toggles */}
                    <div className="hidden sm:flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full p-1 shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Create Button */}
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-2.5 px-5 rounded-full shadow-lg shadow-amber-500/20 transition-all active:scale-95 border border-amber-400/20">
                        <Plus size={18} strokeWidth={3} />
                        <span>Create Listing</span>
                    </button>
                </div>
            </div>

            {/* Grid View */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                    >
                        {filteredListings.map((listing, idx) => (
                            <Link 
                                href={`/host/listings/${listing.id}`} 
                                key={listing.id}
                                className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                                    {getImageUrl(listing) ? (
                                        <img 
                                            src={getImageUrl(listing)} 
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
                                            <Home size={32} />
                                            <span className="text-sm font-medium">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Top Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {getStatusBadge(listing)}
                                    </div>
                                    
                                    {/* Delete Button (Hover) */}
                                    <button 
                                        onClick={(e) => handleDeleteClick(e, listing.id)}
                                        className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                                            {listing.title || 'Untitled Draft'}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm font-bold text-neutral-900 dark:text-white shrink-0">
                                            <Star size={14} className="fill-neutral-900 dark:fill-white" />
                                            <span>New</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 line-clamp-1 capitalize">
                                        {listing.type === 'rental' ? (listing.property_type?.replace('_', ' ') || 'Property') : listing.type} • {listing.address_city || 'Location pending'}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-end justify-between">
                                        <div>
                                            {listing.type === 'event' ? (
                                                <span className="text-lg font-black text-neutral-900 dark:text-white">Tickets</span>
                                            ) : (
                                                <>
                                                    <span className="text-lg font-black text-neutral-900 dark:text-white">{formatConverted(listing.price || 0, listing.currency || 'USD')}</span>
                                                    <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                                                        {listing.type === 'tour' ? ' / person' : ' / night'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                ) : (
                    /* List View */
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-4"
                    >
                        {filteredListings.map((listing) => (
                            <Link 
                                href={`/host/listings/${listing.id}`} 
                                key={listing.id}
                                className="group bg-white rounded-2xl border border-neutral-200 p-4 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-6"
                            >
                                <div className="relative w-full sm:w-48 h-32 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                                    {getImageUrl(listing) ? (
                                        <img 
                                            src={getImageUrl(listing)} 
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                            <Home size={24} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 sm:hidden">
                                        {getStatusBadge(listing)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-neutral-900 truncate group-hover:text-amber-600 transition-colors">
                                            {listing.title || 'Untitled Draft'}
                                        </h3>
                                        <div className="hidden sm:block shrink-0">
                                            {getStatusBadge(listing)}
                                        </div>
                                    </div>
                                    <p className="text-neutral-500 text-sm mb-2 capitalize">
                                        {listing.type === 'rental' ? (listing.property_type?.replace('_', ' ') || 'Property') : listing.type}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
                                        <MapPin size={14} />
                                        <span className="truncate">{listing.address_city ? `${listing.address_city}, ${listing.address_country}` : 'Location pending'}</span>
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-neutral-100 pt-4 sm:pt-0 pl-0 sm:pl-6 sm:border-l">
                                    <div className="text-left sm:text-right">
                                        {listing.type === 'event' ? (
                                            <>
                                                <div className="text-lg font-black text-neutral-900">Tickets</div>
                                                <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider">Available</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-lg font-black text-neutral-900">{formatConverted(listing.price || 0, listing.currency || 'USD')}</div>
                                                <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                                                    {listing.type === 'tour' ? 'Per person' : 'Per night'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button 
                                            onClick={(e) => handleDeleteClick(e, listing.id)}
                                            className="text-neutral-400 hover:text-white hover:bg-rose-500 transition-colors bg-neutral-50 p-2 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button className="text-neutral-400 hover:text-amber-600 transition-colors bg-neutral-50 hover:bg-amber-50 p-2 rounded-full">
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <HostSelectionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
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
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight">Delete Listing?</h3>
                            <p className="text-neutral-500 mb-8 font-medium">Are you sure you want to permanently delete this listing? All associated data will be lost. This action cannot be undone.</p>
                            
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => setListingToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 px-4 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
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
