"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Home, DollarSign, Image as ImageIcon, MapPin, CheckCircle2, XCircle, Users, Shield, Power, Settings2, Map, Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getStorageUrl } from '@/lib/url';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

const AVAILABLE_AMENITIES = [
    { id: 'wifi', name: 'Wifi' },
    { id: 'tv', name: 'TV' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'washer', name: 'Washer' },
    { id: 'free_parking', name: 'Free parking' },
    { id: 'paid_parking', name: 'Paid parking' },
    { id: 'ac', name: 'Air conditioning' },
    { id: 'workspace', name: 'Dedicated workspace' },
    { id: 'pool', name: 'Pool' },
    { id: 'hot_tub', name: 'Hot tub' },
    { id: 'patio', name: 'Patio' },
    { id: 'bbq', name: 'BBQ grill' },
    { id: 'outdoor_dining', name: 'Outdoor dining' },
    { id: 'fire_pit', name: 'Fire pit' },
    { id: 'pool_table', name: 'Pool table' },
    { id: 'indoor_fireplace', name: 'Indoor fireplace' },
    { id: 'piano', name: 'Piano' },
    { id: 'exercise_equipment', name: 'Exercise equipment' },
    { id: 'lake_access', name: 'Lake access' },
    { id: 'beach_access', name: 'Beach access' },
    { id: 'ski', name: 'Ski-in/Ski-out' },
    { id: 'outdoor_shower', name: 'Outdoor shower' }
];
const AVAILABLE_SAFETY_ITEMS = [
    { id: 'smoke_alarm', name: 'Smoke alarm' },
    { id: 'first_aid', name: 'First aid kit' },
    { id: 'fire_extinguisher', name: 'Fire extinguisher' },
    { id: 'carbon_monoxide', name: 'Carbon monoxide alarm' }
];

export default function ListingManagementPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id;
    const { currency, convertPrice, formatCurrency } = useCurrencyFormatter();

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'capacity' | 'amenities' | 'location' | 'pricing' | 'photos' | 'event_info'>('details');
    
    // Master State
    const [isActive, setIsActive] = useState(true);
    const [isDraft, setIsDraft] = useState(false);
    
    // Details State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [propertyType, setPropertyType] = useState('apartment');
    const [privacyType, setPrivacyType] = useState('entire_place');
    const [type, setType] = useState('rental');
    
    // Capacity State
    const [guests, setGuests] = useState(1);
    const [bedrooms, setBedrooms] = useState(1);
    const [beds, setBeds] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    
    // Amenities & Safety State
    const [amenities, setAmenities] = useState<string[]>([]);
    const [safetyItems, setSafetyItems] = useState<string[]>([]);
    
    // Location State
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [apt, setApt] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [latitude, setLatitude] = useState<number>(33.5731); // Default Casablanca
    const [longitude, setLongitude] = useState<number>(-7.5898);
    
    // Pricing State
    const [price, setPrice] = useState('');
    const [listingCurrency, setListingCurrency] = useState(currency);
    
    // Event Meta State
    const [startDatetime, setStartDatetime] = useState('');
    const [endDatetime, setEndDatetime] = useState('');
    const [venueName, setVenueName] = useState('');
    const [ageRestriction, setAgeRestriction] = useState('');
    const [isWaitlistEnabled, setIsWaitlistEnabled] = useState(false);
    
    // Tickets State
    const [tickets, setTickets] = useState<{name: string, price: number, quantity_available: number, description: string}[]>([]);
    
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState('');
    
    const [showExitWarning, setShowExitWarning] = useState(false);
    const initialPayloadRef = useRef<string | null>(null);

    const getPayload = () => ({
        is_active: isActive,
        is_draft: isDraft,
        title,
        description,
        property_type: propertyType,
        privacy_type: privacyType,
        guests_count: guests,
        bedrooms_count: bedrooms,
        beds_count: beds,
        bathrooms_count: bathrooms,
        amenities,
        safety_items: safetyItems,
        address_country: country,
        address_city: city,
        address_street: street,
        address_apt: apt,
        address_province: province,
        address_postal_code: postalCode,
        latitude,
        longitude,
        price: parseFloat(price) || 0,
        currency: listingCurrency,
        ...(type === 'event' && {
            event_meta: {
                start_datetime: startDatetime || null,
                end_datetime: endDatetime || null,
                venue_name: venueName,
                age_restriction: ageRestriction,
                is_waitlist_enabled: isWaitlistEnabled
            },
            tickets: JSON.stringify(tickets)
        })
    });

    useEffect(() => {
        if (!loading && listing && !initialPayloadRef.current) {
            initialPayloadRef.current = JSON.stringify(getPayload());
        }
    }, [loading, listing, getPayload]);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await api.get(`/listings/${listingId}`);
                if (res.data?.status === 'success') {
                    const data = res.data.data;
                    setListing(data);
                    
                    setIsActive(data.is_active ?? true);
                    setIsDraft(data.is_draft || false);
                    
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setPropertyType(data.property_type || 'apartment');
                    setPrivacyType(data.privacy_type || 'entire_place');
                    setType(data.type || 'rental');
                    
                    setGuests(data.guests_count || 1);
                    setBedrooms(data.bedrooms_count || 1);
                    setBeds(data.beds_count || 1);
                    setBathrooms(data.bathrooms_count || 1);
                    
                    setAmenities(data.amenities || []);
                    setSafetyItems(data.safety_items || []);
                    
                    setCountry(data.address_country || '');
                    setCity(data.address_city || '');
                    setStreet(data.address_street || '');
                    setApt(data.address_apt || '');
                    setProvince(data.address_province || '');
                    setPostalCode(data.address_postal_code || '');
                    
                    if (data.latitude && data.longitude) {
                        setLatitude(parseFloat(data.latitude));
                        setLongitude(parseFloat(data.longitude));
                    }
                    
                    const savedCurrency = data.currency || currency;
                    setListingCurrency(currency);
                    setPrice(data.price ? convertPrice(data.price, savedCurrency, currency).toFixed(2) : '');

                    if (data.event_meta) {
                        setStartDatetime(data.event_meta.start_datetime ? data.event_meta.start_datetime.replace(' ', 'T').substring(0, 16) : '');
                        setEndDatetime(data.event_meta.end_datetime ? data.event_meta.end_datetime.replace(' ', 'T').substring(0, 16) : '');
                        setVenueName(data.event_meta.venue_name || '');
                        setAgeRestriction(data.event_meta.age_restriction || '');
                        setIsWaitlistEnabled(data.event_meta.is_waitlist_enabled || false);
                    }
                    if (data.tickets) {
                        setTickets(data.tickets.map((t: any) => ({
                            ...t,
                            price: convertPrice(t.price || 0, data.currency || 'USD', currency).toFixed(2)
                        })));
                    }
                } else {
                    router.push('/host/dashboard');
                }
            } catch (error) {
                console.error("Failed to fetch listing:", error);
                router.push('/host/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [listingId, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...getPayload(), currency: currency };

            const res = await api.put(`/listings/${listingId}`, payload);
            
            if (res.data?.status === 'success') {
                setListing(res.data.data);
                initialPayloadRef.current = JSON.stringify(payload);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to update listing:", error);
            setShowError("Failed to save changes. Please try again.");
            setTimeout(() => setShowError(''), 5000);
        } finally {
            setSaving(false);
        }
    };

    const [isDeletingPhoto, setIsDeletingPhoto] = useState<number | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

    const handleDeletePhoto = (e: React.MouseEvent, photoId: number) => {
        e.stopPropagation();
        setPhotoToDelete(photoId);
    };

    const confirmDeletePhoto = async () => {
        if (!photoToDelete) return;
        setIsDeletingPhoto(photoToDelete);
        const idToDelete = photoToDelete;
        setPhotoToDelete(null);
        
        try {
            const res = await api.delete(`/listings/${listingId}/photos/${idToDelete}`);
            if (res.data?.status === 'success') {
                setListing(res.data.data);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to delete photo:', error);
            setShowError('Failed to delete photo. Please try again.');
            setTimeout(() => setShowError(''), 5000);
        } finally {
            setIsDeletingPhoto(null);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const files = Array.from(e.target.files);
        const fd = new FormData();
        files.forEach(file => fd.append('photos[]', file));

        setIsUploading(true);
        try {
            const res = await api.post(`/listings/${listingId}/photos`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.status === 'success') {
                setListing(res.data.data);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to upload photos:', error);
            setShowError('Failed to upload photos. Please try again.');
            setTimeout(() => setShowError(''), 5000);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const setAsCover = async (photoId: number) => {
        if (!listing.photo_urls) return;
        
        const index = listing.photo_urls.findIndex((p: any) => p.id === photoId);
        if (index <= 0) return;
        
        const newOrderIds = listing.photo_urls.map((p: any) => p.id);
        const [selected] = newOrderIds.splice(index, 1);
        newOrderIds.unshift(selected);

        try {
            const res = await api.post(`/listings/${listingId}/photos/reorder`, { photo_ids: newOrderIds });
            if (res.data?.status === 'success') {
                setListing(res.data.data);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to set cover photo:', error);
            setShowError('Failed to set cover photo. Please try again.');
            setTimeout(() => setShowError(''), 5000);
        }
    };

    const toggleAmenity = (item: string) => {
        setAmenities(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    const toggleSafety = (item: string) => {
        setSafetyItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
            </div>
        );
    }

    if (!listing) return null;

    const photoObj = listing.photo_urls?.[0];
    const coverUrl = getStorageUrl(photoObj?.large || photoObj?.original || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200&auto=format&fit=crop');

    const isValidEventDates = () => {
        if (type !== 'event') return true;
        if (!startDatetime || !endDatetime) return false;
        const start = new Date(startDatetime).getTime();
        const end = new Date(endDatetime).getTime();
        const now = new Date().getTime();
        return start > now && end > start;
    };

    const isReadyToPublish = title && price && parseFloat(price) > 0 && listing.photo_urls && listing.photo_urls.length >= (type === 'rental' ? 5 : 1) && isValidEventDates();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/40 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-[#0a0a0a] dark:to-[#0a0a0a] pb-24 font-sans selection:bg-amber-500/30 transition-colors duration-300">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                const currentPayload = JSON.stringify(getPayload());
                                if (initialPayloadRef.current && currentPayload !== initialPayloadRef.current) {
                                    setShowExitWarning(true);
                                } else {
                                    router.push('/host/dashboard');
                                }
                            }}
                            className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors text-neutral-600 dark:text-neutral-300"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white truncate max-w-[200px] md:max-w-xs">{title || 'Untitled'}</h1>
                            
                            {/* Status Badge */}
                            {isDraft ? (
                                <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-neutral-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span> Draft
                                </span>
                            ) : isActive ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-rose-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Paused
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isDraft ? (
                            <div className="relative group flex items-center">
                                <button 
                                    onClick={() => {
                                        if (!isReadyToPublish) return;
                                        setIsDraft(false);
                                        setIsActive(true);
                                    }}
                                    disabled={!isReadyToPublish}
                                    className={`px-4 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 border shadow-sm ${!isReadyToPublish ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 border-amber-600'}`}
                                >
                                    <Power size={18} />
                                    <span className="hidden sm:inline">Publish Listing</span>
                                </button>
                                {!isReadyToPublish && (
                                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        You must provide a title, price, and at least 5 photos before publishing.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsActive(!isActive)}
                                className={`px-4 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 border ${isActive ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                            >
                                <Power size={18} className={isActive ? 'text-rose-500' : 'text-emerald-500'} />
                                <span className="hidden sm:inline">{isActive ? 'Pause Listing' : 'Activate Listing'}</span>
                            </button>
                        )}
                        
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-neutral-900 text-white rounded-full font-bold hover:bg-neutral-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span className="hidden sm:inline">Save Changes</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        Changes saved successfully!
                    </motion.div>
                )}
                
                {showError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
                    >
                        <XCircle size={20} />
                        {showError}
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 shrink-0">
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 sticky top-28">
                        {[
                            { id: 'details', icon: Settings2, label: 'Overview & Details' },
                            ...(type === 'rental' ? [
                                { id: 'capacity', icon: Users, label: 'Capacity & Rooms' },
                                { id: 'amenities', icon: Shield, label: 'Amenities & Safety' }
                            ] : type === 'event' ? [
                                { id: 'event_info', icon: Calendar, label: 'Event Information' }
                            ] : []),
                            { id: 'location', icon: Map, label: type === 'event' ? 'Location & Venue' : 'Location Details' },
                            { id: 'pricing', icon: DollarSign, label: type === 'event' ? 'Ticketing Strategy' : 'Pricing Strategy' },
                            { id: 'photos', icon: ImageIcon, label: 'Photos & Media' },
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-white text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/20 dark:shadow-white/10 scale-[1.02]' : 'text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white hover:shadow-sm'}`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-amber-400' : 'text-neutral-400'} /> 
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    
                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none space-y-8">
                            <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <Settings2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Listing Details</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Manage the core information about your listing.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium text-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium text-neutral-900 dark:text-white resize-none"
                                    />
                                </div>
                                {type === 'rental' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Property Type</label>
                                            <select 
                                                value={propertyType}
                                                onChange={(e) => setPropertyType(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium text-neutral-900 dark:text-white"
                                            >
                                                <option value="apartment">Apartment</option>
                                                <option value="house">House</option>
                                                <option value="villa">Villa</option>
                                                <option value="riad">Riad</option>
                                                <option value="cabin">Cabin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Privacy Type</label>
                                            <select 
                                                value={privacyType}
                                                onChange={(e) => setPrivacyType(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium text-neutral-900 dark:text-white"
                                            >
                                                <option value="entire_place">Entire Place</option>
                                                <option value="private_room">Private Room</option>
                                                <option value="shared_room">Shared Room</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* EVENT INFO TAB */}
                    {activeTab === 'event_info' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none space-y-8">
                            <div className="flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Event Information</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Set the dates, times, and rules for your upcoming event.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Start Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={startDatetime}
                                        min={new Date().toISOString().slice(0, 16)}
                                        onChange={(e) => setStartDatetime(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">End Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={endDatetime}
                                        min={startDatetime || new Date().toISOString().slice(0, 16)}
                                        onChange={(e) => setEndDatetime(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Venue Name (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={venueName}
                                        onChange={(e) => setVenueName(e.target.value)}
                                        placeholder="e.g. Madison Square Garden"
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Total Ticket Capacity</label>
                                    <input 
                                        type="number" 
                                        value={guests}
                                        onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Age Restriction</label>
                                    <select 
                                        value={ageRestriction}
                                        onChange={(e) => setAgeRestriction(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white"
                                    >
                                        <option value="">None / All Ages</option>
                                        <option value="18+">18+ Only</option>
                                        <option value="21+">21+ Only</option>
                                        <option value="family">Family Friendly</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CAPACITY TAB */}
                    {activeTab === 'capacity' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                            <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Capacity & Rooms</h2>
                            <div className="space-y-6 max-w-xl">
                                {[
                                    { label: 'Guests', value: guests, setter: setGuests, desc: 'Maximum number of guests allowed' },
                                    { label: 'Bedrooms', value: bedrooms, setter: setBedrooms, desc: 'Number of bedrooms guests can access' },
                                    { label: 'Beds', value: beds, setter: setBeds, desc: 'Total number of beds available' },
                                    { label: 'Bathrooms', value: bathrooms, setter: setBathrooms, desc: 'Number of bathrooms available' }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">{item.label}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => item.setter(Math.max(1, item.value - 1))}
                                                className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                                            >-</button>
                                            <span className="w-6 text-center font-bold text-lg dark:text-white">{item.value}</span>
                                            <button 
                                                onClick={() => item.setter(item.value + 1)}
                                                className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AMENITIES TAB */}
                    {activeTab === 'amenities' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Amenities</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">Select all the amenities your property offers.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {AVAILABLE_AMENITIES.map((amenity) => (
                                        <label key={amenity.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${amenities.includes(amenity.id) ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={amenities.includes(amenity.id)}
                                                onChange={() => toggleAmenity(amenity.id)}
                                                className="w-5 h-5 accent-neutral-900 dark:accent-white rounded"
                                            />
                                            <span className="font-bold text-neutral-900 dark:text-white">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Safety Items</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">Check all the safety equipment available.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {AVAILABLE_SAFETY_ITEMS.map((item) => (
                                        <label key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${safetyItems.includes(item.id) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={safetyItems.includes(item.id)}
                                                onChange={() => toggleSafety(item.id)}
                                                className="w-5 h-5 accent-emerald-500 rounded"
                                            />
                                            <span className="font-bold text-neutral-900 dark:text-white">{item.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* LOCATION TAB */}
                    {activeTab === 'location' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Location Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Country</label>
                                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Street Address</label>
                                        <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Apt, Suite, etc. (Optional)</label>
                                        <input type="text" value={apt} onChange={(e) => setApt(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">City</label>
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Province / State</label>
                                        <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Postal Code</label>
                                        <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Pinpoint on Map</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">Drag the map to set the exact location of your property.</p>
                                <div className="w-full h-96 rounded-2xl overflow-hidden relative border border-neutral-200 dark:border-neutral-800">
                                    <InteractiveMap 
                                        center={[latitude, longitude]} 
                                        onMoveEnd={(lat, lng) => {
                                            setLatitude(lat);
                                            setLongitude(lng);
                                        }} 
                                    />
                                    {/* Center Pin Marker */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none drop-shadow-md">
                                        <MapPin className="text-amber-500 fill-white w-12 h-12" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PRICING TAB */}
                    {activeTab === 'pricing' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none space-y-8">
                            <div className="flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{type === 'event' ? 'Ticketing Strategy' : 'Pricing Strategy'}</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Set your prices to attract more bookings.</p>
                                </div>
                            </div>
                            {type === 'rental' ? (
                                <div className="max-w-md">
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Base Nightly Price</label>
                                    <div className="relative flex gap-4">
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <DollarSign size={20} className="text-neutral-400" />
                                            </div>
                                            <input 
                                                type="number" 
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-black text-3xl text-neutral-900"
                                            />
                                        </div>
                                        <div className="w-32 px-4 py-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-xl text-neutral-500 flex items-center justify-center">
                                            {currency}
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-500 mt-4 font-medium p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                                        <span className="font-bold block mb-1">Tip from Wijha:</span>
                                        Researching similar properties in your area and offering a competitive price can significantly increase your early bookings. Your price is saved in {listingCurrency}.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {tickets.map((ticket, index) => (
                                        <div key={index} className="p-6 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 relative group">
                                            <button 
                                                onClick={() => setTickets(tickets.filter((_, i) => i !== index))}
                                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                                                title="Remove Ticket"
                                            >
                                                ✕
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Ticket Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. VIP, General Admission"
                                                        value={ticket.name}
                                                        onChange={(e) => {
                                                            const newT = [...tickets];
                                                            newT[index].name = e.target.value;
                                                            setTickets(newT);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Price ({currency})</label>
                                                    <input 
                                                        type="number" 
                                                        value={ticket.price}
                                                        onChange={(e) => {
                                                            const newT = [...tickets];
                                                            newT[index].price = parseFloat(e.target.value) || 0;
                                                            setTickets(newT);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Available Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        value={ticket.quantity_available}
                                                        onChange={(e) => {
                                                            const newT = [...tickets];
                                                            newT[index].quantity_available = parseInt(e.target.value) || 0;
                                                            setTickets(newT);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Description (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="What's included in this ticket?"
                                                        value={ticket.description || ''}
                                                        onChange={(e) => {
                                                            const newT = [...tickets];
                                                            newT[index].description = e.target.value;
                                                            setTickets(newT);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => setTickets([...tickets, { name: '', price: 0, quantity_available: 100, description: '' }])}
                                        className="w-full py-4 border-2 border-dashed border-emerald-200 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 hover:border-emerald-500 transition-colors"
                                    >
                                        + Add Another Ticket Tier
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PHOTOS TAB */}
                    {activeTab === 'photos' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900 dark:text-white">Media Gallery</h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Drag to reorder or click to delete.</p>
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="text-sm font-bold text-amber-500 hover:text-amber-600 bg-amber-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : null}
                                        {isUploading ? 'Uploading...' : 'Upload New Photos'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3 relative h-96 rounded-3xl overflow-hidden group border-2 border-transparent hover:border-amber-500 transition-colors cursor-pointer">
                                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black text-neutral-900 shadow-md">
                                        COVER PHOTO
                                    </div>

                                    {photoObj && (
                                        <button 
                                            onClick={(e) => handleDeletePhoto(e, photoObj.id)}
                                            disabled={isDeletingPhoto === photoObj.id}
                                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-500 hover:text-white disabled:opacity-50"
                                        >
                                            {isDeletingPhoto === photoObj.id ? <Loader2 size={16} className="animate-spin" /> : '✕'}
                                        </button>
                                    )}
                                </div>
                                {listing.photo_urls?.slice(1).map((photo: any, idx: number) => {
                                    const imgUrl = getStorageUrl(photo.large || photo.original);
                                    
                                    return (
                                        <div key={idx} className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer border border-neutral-200">
                                            <img src={imgUrl} alt={`Photo ${idx+2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <button 
                                                onClick={(e) => handleDeletePhoto(e, photo.id)}
                                                disabled={isDeletingPhoto === photo.id}
                                                className="absolute top-2 right-2 w-8 h-8 bg-white/90 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-500 hover:text-white disabled:opacity-50"
                                            >
                                                {isDeletingPhoto === photo.id ? <Loader2 size={14} className="animate-spin" /> : '✕'}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setAsCover(photo.id); }}
                                                className="absolute top-2 left-2 bg-white/90 text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-amber-500 hover:text-white"
                                            >
                                                Set as Cover
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* DELETE CONFIRMATION MODAL */}
            {photoToDelete !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ⚠️
                        </div>
                        <h3 className="text-2xl font-black text-center text-neutral-900 dark:text-white mb-2">Delete Photo?</h3>
                        <p className="text-center text-neutral-500 dark:text-neutral-400 font-medium mb-8">Are you sure you want to delete this photo? This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setPhotoToDelete(null)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDeletePhoto}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* EXIT WARNING MODAL */}
            {showExitWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ⚠️
                        </div>
                        <h3 className="text-2xl font-black text-center text-neutral-900 dark:text-white mb-2">Unsaved Changes</h3>
                        <p className="text-center text-neutral-500 dark:text-neutral-400 font-medium mb-8">You have unsaved changes. Are you sure you want to exit without saving?</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowExitWarning(false)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => router.push('/host/dashboard')}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
