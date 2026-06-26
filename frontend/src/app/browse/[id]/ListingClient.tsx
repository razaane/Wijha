'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import Header from '@/components/landing/Header';
import { Category } from '@/components/landing/LandingClient';
import { Star, Heart, Share, MapPin, Check, Grid, X, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, Award } from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { toggleFavorite } from '@/lib/favorites.api';
import Link from 'next/link';

export default function ListingClient({ id }: { id: string }) {
    const [listing, setListing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<Category>('stays');
    const { formatConverted } = useCurrencyFormatter();

    // UI States
    const [isCopied, setIsCopied] = useState(false);
    
    // Auth & Favorites
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { hasFavorite, addFavorite, removeFavorite } = useFavoriteStore();
    
    // Gallery State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    // Booking Widget States
    const [checkInStr, setCheckInStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [checkOutStr, setCheckOutStr] = useState(format(addDays(new Date(), 5), 'yyyy-MM-dd'));
    const [guests, setGuests] = useState(1);

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
                <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} hideSearch={true} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
                <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} hideSearch={true} />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <h1 className="text-3xl font-bold">Listing not found</h1>
                    <p className="text-neutral-500">The property you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    // Dynamic calculations
    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    let calculatedNights = differenceInDays(checkOutDate, checkInDate);
    if (calculatedNights < 1 || isNaN(calculatedNights)) {
        calculatedNights = 1; // Fallback
    }

    const pricePerNight = listing.price || 0;
    const nightsTotal = pricePerNight * calculatedNights;
    const cleaningFee = 50;
    const serviceFee = Math.round(nightsTotal * 0.12); // 12% service fee
    const totalPrice = nightsTotal + cleaningFee + serviceFee;

    // Photos
    const photos = listing.photo_urls && listing.photo_urls.length > 0 ? listing.photo_urls : [];
    const getPhoto = (index: number) => {
        return photos[index]?.original ? getStorageUrl(photos[index].original) : '';
    };

    // Actions
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing.title,
                    url: url
                });
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            navigator.clipboard.writeText(url);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please login to save favorites.');
            return;
        }

        const listingId = Number(id);
        const isFav = hasFavorite(listingId);
        
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
        }
    };

    const openGallery = (index: number) => {
        setActivePhotoIndex(index);
        setIsGalleryOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans pb-24">
            <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} isCompact={true} hideSearch={true} />
            
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{listing.title}</h1>
                        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                            <Star size={14} className="text-neutral-900 dark:text-white fill-current mr-1" />
                            <span className="text-neutral-900 dark:text-white mr-1">{listing.rating || '4.98'}</span>
                            <span className="underline decoration-neutral-300 font-bold mr-2 hover:text-neutral-900 cursor-pointer">120 reviews</span>
                            <span className="mx-2">·</span>
                            <ShieldCheck size={14} className="text-amber-500 mr-1" />
                            <span className="mr-2 font-medium">Superhost</span>
                            <span className="mx-2">·</span>
                            <span className="underline decoration-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
                                {listing.address_city}, {listing.address_state ? `${listing.address_state}, ` : ''}{listing.address_country}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleShare} className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm">
                            {isCopied ? <Check size={16} className="text-green-500" /> : <Share size={16} />} 
                            {isCopied ? 'Copied!' : 'Share'}
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm">
                            <Heart size={16} className={hasFavorite(Number(id)) ? "fill-rose-500 text-rose-500" : ""} /> 
                            {hasFavorite(Number(id)) ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Cinematic Photo Grid */}
                {photos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] mb-12 rounded-2xl overflow-hidden relative">
                        <div onClick={() => openGallery(0)} className={`col-span-1 md:col-span-2 row-span-2 h-full cursor-pointer relative group overflow-hidden ${photos.length === 1 ? 'md:col-span-4' : ''}`}>
                            <img src={getPhoto(0)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Main" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                        {photos[1] && (
                            <div onClick={() => openGallery(1)} className={`hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden ${photos.length === 2 ? 'row-span-2 md:col-span-2' : ''}`}>
                                <img src={getPhoto(1)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 1" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            </div>
                        )}
                        {photos[2] && photos.length > 2 && (
                            <div onClick={() => openGallery(2)} className={`hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden ${photos.length === 3 ? 'md:col-span-2' : ''}`}>
                                <img src={getPhoto(2)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 2" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            </div>
                        )}
                        {photos[3] && photos.length > 3 && (
                            <div onClick={() => openGallery(3)} className={`hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden ${photos.length === 4 ? 'row-span-2' : ''}`}>
                                <img src={getPhoto(3)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 3" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            </div>
                        )}
                        {photos[4] && photos.length > 4 && (
                            <div onClick={() => openGallery(4)} className="hidden md:block col-span-1 row-span-1 h-full cursor-pointer relative group overflow-hidden">
                                <img src={getPhoto(4)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery 4" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            </div>
                        )}
                        {photos.length > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); openGallery(0); }} className="absolute bottom-4 right-4 bg-white dark:bg-neutral-900 px-4 py-1.5 rounded-lg border border-neutral-900 dark:border-neutral-100 text-sm font-bold flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10 shadow-sm">
                                <Grid size={16} /> Show all photos
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-[300px] mb-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 font-medium">
                        No photos available
                    </div>
                )}

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

                        {/* Reviews Section */}
                        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 mb-8">
                                <Star size={24} className="text-neutral-900 dark:text-white fill-current" />
                                <h2 className="text-2xl font-bold">{listing.rating || 'New'} · {listing.reviews_count || 0} reviews</h2>
                            </div>
                            
                            {listing.reviews && listing.reviews.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {listing.reviews.map((review: any) => (
                                            <div key={review.id} className="flex flex-col">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <img src={review.user?.avatar ? getStorageUrl(review.user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name || 'User'}`} alt={review.user?.name || 'User'} className="w-12 h-12 rounded-full bg-neutral-100" />
                                                    <div>
                                                        <h3 className="font-bold">{review.user?.name || 'Anonymous'}</h3>
                                                        <div className="text-sm text-neutral-500">{format(new Date(review.created_at), 'MMMM yyyy')}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 mb-2">
                                                    {[...Array(review.rating || 5)].map((_, i) => (
                                                        <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
                                                    ))}
                                                </div>
                                                <p className="text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {listing.reviews_count > 4 && (
                                        <button className="mt-8 px-6 py-3 border border-neutral-900 dark:border-neutral-100 rounded-lg font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                            Show all {listing.reviews_count} reviews
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-neutral-500 dark:text-neutral-400 italic">No reviews yet. Be the first to leave a review after your stay!</p>
                            )}
                        </div>

                        {/* Map Placeholder */}
                        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold mb-6">Where you'll be</h2>
                            <div className="w-full h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center flex-col text-neutral-500 relative overflow-hidden">
                                <MapPin size={48} className="mb-4 text-neutral-400 drop-shadow-md" />
                                <span className="font-medium text-lg">{listing.address_city}, {listing.address_country}</span>
                                <span className="text-sm">Exact location provided after booking</span>
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            </div>
                        </div>

                        {/* Host Info */}
                        <div className="py-8">
                            <div className="flex items-center gap-4 mb-6">
                                <img 
                                    src={listing.user?.avatar ? getStorageUrl(listing.user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.user?.name || 'User'}`} 
                                    className="w-16 h-16 rounded-full object-cover shadow-sm bg-neutral-100" 
                                    alt={listing.user?.name}
                                />
                                <div>
                                    <h2 className="text-2xl font-bold">Hosted by {listing.user?.name}</h2>
                                    <p className="text-neutral-500">Joined in 2026</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 mb-6">
                                <div className="flex items-center gap-2">
                                    <Star size={20} className="text-amber-500" />
                                    <span className="font-medium">144 Reviews</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-amber-500" />
                                    <span className="font-medium">Identity verified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={20} className="text-amber-500" />
                                    <span className="font-medium">Superhost</span>
                                </div>
                            </div>

                            <p className="text-neutral-700 dark:text-neutral-300 font-light max-w-2xl mb-8 leading-relaxed">
                                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests. We look forward to welcoming you to our beautiful home!
                            </p>

                            <Link href={{ pathname: `/contact-host/${listing.id}`, query: { guests: guests, check_in: checkInStr, check_out: checkOutStr } }} className="inline-flex px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-bold items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                                <MessageCircle size={18} /> Contact Host
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-28 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl bg-white dark:bg-[#1a1a1a]">
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">{formatConverted(listing.price, listing.currency)}</span>
                                <span className="text-neutral-500 font-medium">night</span>
                            </div>

                            <div className="border border-neutral-300 dark:border-neutral-600 rounded-xl mb-4 overflow-hidden focus-within:border-neutral-900 dark:focus-within:border-white focus-within:ring-1 focus-within:ring-neutral-900 dark:focus-within:ring-white transition-all">
                                <div className="grid grid-cols-2 border-b border-neutral-300 dark:border-neutral-600">
                                    <div className="relative p-3 border-r border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Check-in</div>
                                        <input 
                                            type="date" 
                                            value={checkInStr}
                                            onChange={(e) => setCheckInStr(e.target.value)}
                                            className="w-full bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer mt-1"
                                        />
                                    </div>
                                    <div className="relative p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Check-out</div>
                                        <input 
                                            type="date" 
                                            value={checkOutStr}
                                            onChange={(e) => setCheckOutStr(e.target.value)}
                                            className="w-full bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer mt-1"
                                            min={checkInStr}
                                        />
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex justify-between items-center">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Guests</div>
                                        <select 
                                            value={guests} 
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                            className="w-full bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none mt-1 cursor-pointer appearance-none"
                                        >
                                            {[...Array(listing.guests_count || 10)].map((_, i) => (
                                                <option key={i+1} value={i+1} className="dark:bg-neutral-900">{i+1} guest{i > 0 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-lg transition-all text-lg mb-4 shadow-md">
                                Reserve
                            </button>
                            <div className="text-center text-neutral-500 text-sm mb-6">You won't be charged yet</div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">{formatConverted(pricePerNight, listing.currency)} x {calculatedNights} nights</span>
                                    <span>{formatConverted(nightsTotal, listing.currency)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">Cleaning fee</span>
                                    <span>{formatConverted(cleaningFee, listing.currency)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-700 dark:text-neutral-300 text-base">
                                    <span className="underline decoration-neutral-300 cursor-pointer">Service fee</span>
                                    <span>{formatConverted(serviceFee, listing.currency)}</span>
                                </div>
                                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex justify-between font-bold text-lg text-neutral-900 dark:text-white">
                                    <span>Total</span>
                                    <span>{formatConverted(totalPrice, listing.currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Photo Gallery Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center p-6 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <button onClick={closeGallery} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 font-medium">
                            <X size={24} /> Close
                        </button>
                        <div className="font-medium tracking-widest">{activePhotoIndex + 1} / {photos.length}</div>
                        <div className="flex gap-4">
                            <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Share size={20} />
                            </button>
                            <button onClick={handleSave} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Heart size={20} className={hasFavorite(Number(id)) ? "fill-rose-500 text-rose-500" : ""} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                        <button 
                            onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                            className="absolute left-4 md:left-12 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        
                        <img 
                            src={getPhoto(activePhotoIndex)} 
                            className="max-h-[85vh] max-w-[90vw] object-contain select-none" 
                            alt={`Gallery photo ${activePhotoIndex + 1}`} 
                        />
                        
                        <button 
                            onClick={() => setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 md:right-12 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
