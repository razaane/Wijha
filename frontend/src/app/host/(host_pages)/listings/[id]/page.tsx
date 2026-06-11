"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Home, DollarSign, Image as ImageIcon, MapPin, CheckCircle2, Users, Shield, Power, Settings2, Map } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getStorageUrl } from '@/lib/url';

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

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'capacity' | 'amenities' | 'location' | 'pricing' | 'photos'>('details');
    
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
    
    const [showSuccess, setShowSuccess] = useState(false);

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
                    
                    setPrice(data.price || '');
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
            const payload = {
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
                price: parseFloat(price)
            };

            const res = await api.put(`/listings/${listingId}`, payload);
            
            if (res.data?.status === 'success') {
                setListing(res.data.data);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to update listing:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
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

    const isReadyToPublish = title && price && parseFloat(price) > 0 && listing.photo_urls && listing.photo_urls.length >= 5;

    return (
        <div className="min-h-screen bg-neutral-50 pb-24">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/host/dashboard" className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors text-neutral-600">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-8 w-px bg-neutral-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-neutral-900 truncate max-w-[200px] md:max-w-xs">{title || 'Untitled'}</h1>
                            
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
                                className={`px-4 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 border ${isActive ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50' : 'bg-neutral-100 border-neutral-200 text-neutral-900 hover:bg-neutral-200'}`}
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
                            ] : []),
                            { id: 'location', icon: Map, label: 'Location Details' },
                            { id: 'pricing', icon: DollarSign, label: 'Pricing Strategy' },
                            { id: 'photos', icon: ImageIcon, label: 'Photos & Media' },
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-white shadow-sm border border-neutral-200 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-neutral-900'}`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    
                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                            <h2 className="text-2xl font-black text-neutral-900 mb-6">Listing Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-neutral-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-900 mb-2">Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-neutral-900 resize-none"
                                    />
                                </div>
                                {type === 'rental' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-900 mb-2">Property Type</label>
                                            <select 
                                                value={propertyType}
                                                onChange={(e) => setPropertyType(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-neutral-900"
                                            >
                                                <option value="apartment">Apartment</option>
                                                <option value="house">House</option>
                                                <option value="villa">Villa</option>
                                                <option value="riad">Riad</option>
                                                <option value="cabin">Cabin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-900 mb-2">Privacy Type</label>
                                            <select 
                                                value={privacyType}
                                                onChange={(e) => setPrivacyType(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-neutral-900"
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

                    {/* CAPACITY TAB */}
                    {activeTab === 'capacity' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                            <h2 className="text-2xl font-black text-neutral-900 mb-6">Capacity & Rooms</h2>
                            <div className="space-y-6 max-w-xl">
                                {[
                                    { label: 'Guests', value: guests, setter: setGuests, desc: 'Maximum number of guests allowed' },
                                    { label: 'Bedrooms', value: bedrooms, setter: setBedrooms, desc: 'Number of bedrooms guests can access' },
                                    { label: 'Beds', value: beds, setter: setBeds, desc: 'Total number of beds available' },
                                    { label: 'Bathrooms', value: bathrooms, setter: setBathrooms, desc: 'Number of bathrooms available' }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
                                        <div>
                                            <h3 className="font-bold text-neutral-900">{item.label}</h3>
                                            <p className="text-sm text-neutral-500">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => item.setter(Math.max(1, item.value - 1))}
                                                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                                            >-</button>
                                            <span className="w-6 text-center font-bold text-lg">{item.value}</span>
                                            <button 
                                                onClick={() => item.setter(item.value + 1)}
                                                className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
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
                            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                                <h2 className="text-2xl font-black text-neutral-900 mb-2">Amenities</h2>
                                <p className="text-neutral-500 mb-6">Select all the amenities your property offers.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {AVAILABLE_AMENITIES.map((amenity) => (
                                        <label key={amenity.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${amenities.includes(amenity.id) ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100 hover:border-neutral-300'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={amenities.includes(amenity.id)}
                                                onChange={() => toggleAmenity(amenity.id)}
                                                className="w-5 h-5 accent-neutral-900 rounded"
                                            />
                                            <span className="font-bold text-neutral-900">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                                <h2 className="text-2xl font-black text-neutral-900 mb-2">Safety Items</h2>
                                <p className="text-neutral-500 mb-6">Check all the safety equipment available.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {AVAILABLE_SAFETY_ITEMS.map((item) => (
                                        <label key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${safetyItems.includes(item.id) ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 hover:border-neutral-300'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={safetyItems.includes(item.id)}
                                                onChange={() => toggleSafety(item.id)}
                                                className="w-5 h-5 accent-emerald-500 rounded"
                                            />
                                            <span className="font-bold text-neutral-900">{item.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* LOCATION TAB */}
                    {activeTab === 'location' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                                <h2 className="text-2xl font-black text-neutral-900 mb-6">Location Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Country</label>
                                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Street Address</label>
                                        <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Apt, Suite, etc. (Optional)</label>
                                        <input type="text" value={apt} onChange={(e) => setApt(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">City</label>
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Province / State</label>
                                        <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Postal Code</label>
                                        <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-neutral-900" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                                <h2 className="text-2xl font-black text-neutral-900 mb-2">Pinpoint on Map</h2>
                                <p className="text-neutral-500 mb-6">Drag the map to set the exact location of your property.</p>
                                <div className="w-full h-96 rounded-2xl overflow-hidden relative border border-neutral-200">
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
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                            <h2 className="text-2xl font-black text-neutral-900 mb-6">Pricing Strategy</h2>
                            <div className="max-w-md">
                                <label className="block text-sm font-bold text-neutral-900 mb-2">Base Nightly Price (USD)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-neutral-500 font-bold">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-black text-3xl text-neutral-900"
                                    />
                                </div>
                                <p className="text-sm text-neutral-500 mt-4 font-medium p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                                    <span className="font-bold block mb-1">Tip from Wijha:</span>
                                    Researching similar properties in your area and offering a competitive price can significantly increase your early bookings.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* PHOTOS TAB */}
                    {activeTab === 'photos' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900">Media Gallery</h2>
                                    <p className="text-sm text-neutral-500">Drag to reorder or click to delete.</p>
                                </div>
                                <button className="text-sm font-bold text-amber-500 hover:text-amber-600 bg-amber-50 px-5 py-2.5 rounded-full transition-colors">
                                    Upload New Photos
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3 relative h-96 rounded-3xl overflow-hidden group border-2 border-transparent hover:border-amber-500 transition-colors cursor-pointer">
                                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black text-neutral-900 shadow-md">
                                        COVER PHOTO
                                    </div>
                                    <div className="absolute inset-0 bg-neutral-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold bg-neutral-900/80 px-6 py-2 rounded-full">Change Cover</span>
                                    </div>
                                </div>
                                {listing.photo_urls?.slice(1).map((photo: any, idx: number) => {
                                    const imgUrl = getStorageUrl(photo.large || photo.original);
                                    
                                    return (
                                        <div key={idx} className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer border border-neutral-200">
                                            <img src={imgUrl} alt={`Photo ${idx+2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-500 hover:text-white">
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
