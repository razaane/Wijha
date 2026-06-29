'use client';

import { useState, useEffect, useRef } from 'react';
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
import dynamic from 'next/dynamic';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

const Map = dynamic(() => import('@/components/InteractiveMap'), { 
    ssr: false, 
    loading: () => <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-neutral-400"><MapPin size={32} /></div>
});

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
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    // Booking Widget States
    const [checkInStr, setCheckInStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [checkOutStr, setCheckOutStr] = useState(format(addDays(new Date(), 5), 'yyyy-MM-dd'));
    const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [childrenCount, setChildrenCount] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const totalGuests = adults + childrenCount;

    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

    const bookingWidgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bookingWidgetRef.current && !bookingWidgetRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
                setIsGuestPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchListing = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/listings/public/${id}`);
                if (res.data?.status === 'success') {
                    const data = res.data.data;
                    setListing(data);
                    
                    if (data.latitude && data.longitude) {
                        setMapCenter([parseFloat(data.latitude), parseFloat(data.longitude)]);
                    } else if (data.address_city && data.address_country) {
                        // Fallback to geocoding the city/country if exact coordinates are missing
                        try {
                            const query = encodeURIComponent(`${data.address_city}, ${data.address_country}`);
                            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                            const geoData = await geoRes.json();
                            if (geoData && geoData.length > 0) {
                                setMapCenter([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                            }
                        } catch (e) {
                            console.error('Failed to geocode location', e);
                        }
                    }
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

                        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold mb-6">Where you'll be</h2>
                            <div className="w-full h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center flex-col text-neutral-500 relative overflow-hidden">
                                {mapCenter ? (
                                    <Map center={mapCenter} markerPosition={mapCenter} onMoveEnd={() => {}} />
                                ) : (
                                    <>
                                        <MapPin size={48} className="mb-4 text-neutral-400 drop-shadow-md" />
                                        <span className="font-medium text-lg text-center px-4">
                                            {listing.address_street ? `${listing.address_street}, ` : ''}{listing.address_city}, {listing.address_country}
                                        </span>
                                        {listing.address_postal_code && <span className="text-sm">{listing.address_postal_code}</span>}
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                                    </>
                                )}
                            </div>
                            <div className="mt-4 flex flex-col items-start gap-1">
                                <div className="font-medium text-lg">
                                    {listing.address_street ? `${listing.address_street}, ` : ''}{listing.address_city}, {listing.address_country}
                                </div>
                                {listing.address_postal_code && <div className="text-neutral-500">{listing.address_postal_code}</div>}
                                {mapCenter && (
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${mapCenter[0]},${mapCenter[1]}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-semibold underline mt-2 hover:text-neutral-600 transition-colors"
                                    >
                                        Show on Google Maps <ChevronRight size={16} />
                                    </a>
                                )}
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
                                </div>
                            </div>
                            
                            {listing.user?.is_verified_host && (
                                <div className="flex gap-6 mb-8 mt-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={20} className="text-[#00a699]" />
                                        <span className="font-medium">Identity verified</span>
                                    </div>
                                </div>
                            )}


                            <Link href={{ pathname: `/contact-host/${listing.id}`, query: { guests: totalGuests, check_in: checkInStr, check_out: checkOutStr } }} className="inline-flex px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-bold items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                                <MessageCircle size={18} /> Contact Host
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="hidden lg:block relative">
                        <div ref={bookingWidgetRef} className="sticky top-28 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl bg-white dark:bg-[#1a1a1a]">
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">{formatConverted(listing.price, listing.currency)}</span>
                                <span className="text-neutral-500 font-medium">night</span>
                            </div>

                            <div className="border border-neutral-300 dark:border-neutral-600 rounded-xl mb-4 focus-within:border-neutral-900 dark:focus-within:border-white focus-within:ring-1 focus-within:ring-neutral-900 dark:focus-within:ring-white transition-all">
                                <div className={`relative ${isDatePickerOpen ? 'z-50' : 'z-10'}`}>
                                    <div className="grid grid-cols-2 border-b border-neutral-200 dark:border-neutral-700">
                                        <div 
                                            className="relative p-3 border-r border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus-within:bg-neutral-50 dark:focus-within:bg-neutral-800 rounded-tl-xl"
                                            onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsGuestPickerOpen(false); }}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white pointer-events-none">Check-in</div>
                                            <div className="text-sm mt-1 text-neutral-700 dark:text-neutral-300">{format(new Date(checkInStr), 'MM/dd/yyyy')}</div>
                                        </div>
                                        <div 
                                            className="relative p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus-within:bg-neutral-50 dark:focus-within:bg-neutral-800 rounded-tr-xl"
                                            onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsGuestPickerOpen(false); }}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white pointer-events-none">Check-out</div>
                                            <div className="text-sm mt-1 text-neutral-700 dark:text-neutral-300">{format(new Date(checkOutStr), 'MM/dd/yyyy')}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Date Picker Popover */}
                                    {isDatePickerOpen && (
                                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200 min-w-[660px]">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-bold">{differenceInDays(new Date(checkOutStr), new Date(checkInStr))} nights</h3>
                                                    <p className="text-sm text-neutral-500">{format(new Date(checkInStr), 'MMM d, yyyy')} - {format(new Date(checkOutStr), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <DateRange
                                                ranges={[{ startDate: new Date(checkInStr), endDate: new Date(checkOutStr), key: 'selection' }]}
                                                onChange={(item: any) => {
                                                    if (item.selection.startDate) setCheckInStr(format(item.selection.startDate, 'yyyy-MM-dd'));
                                                    if (item.selection.endDate) setCheckOutStr(format(item.selection.endDate, 'yyyy-MM-dd'));
                                                }}
                                                months={2}
                                                direction="horizontal"
                                                showDateDisplay={false}
                                                minDate={new Date()}
                                                rangeColors={['#262626']}
                                                className="w-full !font-sans"
                                            />
                                            <div className="flex justify-between mt-4">
                                                <button className="underline font-bold text-sm" onClick={() => {
                                                    setCheckInStr(format(new Date(), 'yyyy-MM-dd'));
                                                    setCheckOutStr(format(addDays(new Date(), 5), 'yyyy-MM-dd'));
                                                }}>Clear dates</button>
                                                <button onClick={() => setIsDatePickerOpen(false)} className="bg-neutral-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Close</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`relative ${isGuestPickerOpen ? 'z-50' : 'z-10'}`}>
                                    <div 
                                        className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex justify-between items-center cursor-pointer focus-within:bg-neutral-50 dark:focus-within:bg-neutral-800 rounded-b-xl"
                                        onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
                                    >
                                        <div className="w-full">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white pointer-events-none">Guests</div>
                                            <div className="text-sm mt-1 text-neutral-900 dark:text-white select-none">
                                                {totalGuests} guest{totalGuests !== 1 ? 's' : ''}{infants > 0 ? `, ${infants} infant${infants !== 1 ? 's' : ''}` : ''}{pets > 0 ? `, ${pets} pet${pets !== 1 ? 's' : ''}` : ''}
                                            </div>
                                        </div>
                                        <div>
                                            {isGuestPickerOpen ? <ChevronLeft size={20} className="rotate-90" /> : <ChevronRight size={20} className="rotate-90" />}
                                        </div>
                                    </div>

                                    {/* Guest Selector Popover */}
                                    {isGuestPickerOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                            
                                            {/* Adults */}
                                            <div className="flex justify-between items-center py-4 border-b border-neutral-200 dark:border-neutral-800">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">Adults</div>
                                                    <div className="text-sm text-neutral-500">Age 13+</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)); }}
                                                        disabled={adults <= 1}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-4 text-center font-medium">{adults}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setAdults(Math.min((listing.guests_count || 10) - childrenCount, adults + 1)); }}
                                                        disabled={totalGuests >= (listing.guests_count || 10)}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <div className="flex justify-between items-center py-4 border-b border-neutral-200 dark:border-neutral-800">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">Children</div>
                                                    <div className="text-sm text-neutral-500">Ages 2–12</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setChildrenCount(Math.max(0, childrenCount - 1)); }}
                                                        disabled={childrenCount <= 0}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-4 text-center font-medium">{childrenCount}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setChildrenCount(Math.min((listing.guests_count || 10) - adults, childrenCount + 1)); }}
                                                        disabled={totalGuests >= (listing.guests_count || 10)}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Infants */}
                                            <div className="flex justify-between items-center py-4 border-b border-neutral-200 dark:border-neutral-800">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">Infants</div>
                                                    <div className="text-sm text-neutral-500">Under 2</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)); }}
                                                        disabled={infants <= 0}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-4 text-center font-medium">{infants}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setInfants(infants + 1); }}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pets */}
                                            <div className="flex justify-between items-center py-4">
                                                <div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">Pets</div>
                                                    <div className="text-sm font-semibold underline text-neutral-900 dark:text-white">Bringing a service animal?</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPets(Math.max(0, pets - 1)); }}
                                                        disabled={pets <= 0}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-4 text-center font-medium">{pets}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPets(pets + 1); }}
                                                        className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 dark:hover:border-white transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-neutral-500 mt-2 mb-4">
                                                This place has a maximum of {listing.guests_count || 10} guests, not including infants.
                                            </div>

                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={() => setIsGuestPickerOpen(false)}
                                                    className="font-bold underline text-neutral-900 dark:text-white hover:text-neutral-600 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

            {/* Photo Tour Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0a0a0a] flex flex-col animate-in slide-in-from-bottom-10 duration-300 overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md z-10 flex items-center justify-between p-4 px-6">
                        <button onClick={closeGallery} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <ChevronLeft size={24} className="text-neutral-900 dark:text-white" />
                        </button>
                        <div className="flex gap-2">
                            <button onClick={handleShare} className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium underline">
                                <Share size={16} /> Share
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium underline">
                                <Heart size={16} className={hasFavorite(Number(id)) ? "fill-rose-500 text-rose-500" : ""} /> 
                                {hasFavorite(Number(id)) ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24">
                        <h1 className="text-3xl font-bold mb-10 text-neutral-900 dark:text-white">Photo tour</h1>
                        
                        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                            {photos.map((photo: any, index: number) => (
                                <div 
                                    key={photo.id || index} 
                                    className="break-inside-avoid mb-4 group relative cursor-pointer"
                                    onClick={() => {
                                        setActivePhotoIndex(index);
                                        setIsLightboxOpen(true);
                                    }}
                                >
                                    <img 
                                        src={getPhoto(index)} 
                                        alt={`Property photo ${index + 1}`}
                                        className="w-full h-auto object-cover rounded-xl bg-neutral-100 dark:bg-neutral-800"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                        {photos.length === 0 && (
                            <div className="text-neutral-500 text-center py-20">No photos available for this listing.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center p-6 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <button onClick={() => setIsLightboxOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 font-medium">
                            <X size={24} /> Close
                        </button>
                        <div className="font-medium tracking-widest text-sm">{activePhotoIndex + 1} / {photos.length}</div>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
                            }}
                            className="absolute left-4 md:left-12 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        
                        <img 
                            src={getPhoto(activePhotoIndex)} 
                            className="max-h-[85vh] max-w-[90vw] object-contain select-none transition-opacity duration-300" 
                            alt={`Gallery photo ${activePhotoIndex + 1}`} 
                        />
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-4 md:right-12 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
