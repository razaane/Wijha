'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, MapPin, Search } from 'lucide-react';
import Header from '@/components/landing/Header';
import { getFavorites, toggleFavorite } from '@/lib/favorites.api';
import { useFavoriteStore } from '@/store/favorite.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function FavoritesClient() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { removeFavorite } = useFavoriteStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    // Auth guard
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error('Error fetching favorites', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemove = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Optimistic UI update
        const previousFavorites = [...favorites];
        setFavorites(favorites.filter(fav => fav.id !== id));
        removeFavorite(id);

        try {
            await toggleFavorite(id);
        } catch (error) {
            // Revert on error
            setFavorites(previousFavorites);
            console.error('Failed to remove favorite', error);
        }
    };

    return (
        <>
            <Header hideSearch={true} />
            <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                            Wishlists
                        </h1>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400">
                            Properties and experiences you've saved for later.
                        </p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm"
                    >
                        <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-neutral-300 dark:text-neutral-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No saved favorites</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
                            As you search, click the heart icon to save your favorite places and experiences here.
                        </p>
                        <Link href="/" className="px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-xl">
                            Start exploring
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
                        <AnimatePresence>
                            {favorites.map((listing) => (
                                <motion.div
                                    key={listing.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link href={`/browse/${listing.id}`} className="group flex flex-col cursor-pointer">
                                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-4 shadow-sm group-hover:shadow-lg transition-all border border-neutral-100 dark:border-neutral-800">
                                            {listing.photo_urls && listing.photo_urls.length > 0 ? (
                                                <img 
                                                    src={listing.photo_urls[0].original} 
                                                    alt={listing.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-400">No Image</div>
                                            )}
                                            
                                            {/* Heart Button */}
                                            <button 
                                                onClick={(e) => handleRemove(e, listing.id)}
                                                className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-red-500 hover:scale-110 active:scale-90 transition-all z-10 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                                            >
                                                <Heart size={20} className="fill-red-500" />
                                            </button>

                                            {/* Guest Favorite Badge */}
                                            {listing.rating >= 4.9 && (
                                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-900 dark:text-white">
                                                    <Star size={12} className="fill-amber-500 text-amber-500" />
                                                    <span>Top Pick</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col pr-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate">
                                                    {listing.address_city}, {listing.address_country}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                                                    <Star size={14} className="fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white" />
                                                    <span>{listing.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-sm truncate mt-1">
                                                {listing.title}
                                            </p>
                                            <div className="mt-2 text-neutral-900 dark:text-white">
                                                <span className="font-bold text-lg">{listing.currency} {listing.price}</span>
                                                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal"> / night</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
