"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Home, MapPin, 
    Loader2, Sparkles, Map as MapIcon, Ticket, 
    Wifi, Tv, Car, Coffee, Wind, UploadCloud, X, CheckCircle2,
    Building2, Flame, ShieldAlert, Plus, Minus, Droplets, Waves, 
    Sun, Monitor, CircleDollarSign, Shirt, Utensils, LayoutGrid, Music, 
    Dumbbell, Umbrella, Snowflake, ShowerHead
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { Country, City } from 'country-state-city';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

// --- Constants ---
const TYPES = [
    { id: 'rental', label: 'Rental', icon: Home },
    { id: 'tour', label: 'Tour', icon: MapIcon },
    { id: 'event', label: 'Event', icon: Ticket },
];

const PROPERTY_TYPES = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building2 },
];

const PRIVACY_TYPES = [
    { id: 'entire_place', label: 'An entire place', desc: 'Guests have the whole place to themselves.' },
    { id: 'private_room', label: 'A room', desc: 'Guests have their own room, plus access to shared spaces.' },
    { id: 'shared_room', label: 'A shared room', desc: 'Guests sleep in a room or common area that may be shared.' },
];

const GUEST_FAVORITES = [
    { id: 'wifi', name: 'Wifi', icon: Wifi },
    { id: 'tv', name: 'TV', icon: Tv },
    { id: 'kitchen', name: 'Kitchen', icon: Coffee },
    { id: 'washer', name: 'Washer', icon: Shirt },
    { id: 'free_parking', name: 'Free parking on premises', icon: Car },
    { id: 'paid_parking', name: 'Paid parking on premises', icon: CircleDollarSign },
    { id: 'ac', name: 'Air conditioning', icon: Wind },
    { id: 'workspace', name: 'Dedicated workspace', icon: Monitor },
];

const STANDOUT_AMENITIES = [
    { id: 'pool', name: 'Pool', icon: Waves },
    { id: 'hot_tub', name: 'Hot tub', icon: Droplets },
    { id: 'patio', name: 'Patio', icon: Sun },
    { id: 'bbq', name: 'BBQ grill', icon: Flame },
    { id: 'outdoor_dining', name: 'Outdoor dining area', icon: Utensils },
    { id: 'fire_pit', name: 'Fire pit', icon: Flame },
    { id: 'pool_table', name: 'Pool table', icon: LayoutGrid },
    { id: 'indoor_fireplace', name: 'Indoor fireplace', icon: Flame },
    { id: 'piano', name: 'Piano', icon: Music },
    { id: 'exercise_equipment', name: 'Exercise equipment', icon: Dumbbell },
    { id: 'lake_access', name: 'Lake access', icon: Waves },
    { id: 'beach_access', name: 'Beach access', icon: Umbrella },
    { id: 'ski', name: 'Ski-in/Ski-out', icon: Snowflake },
    { id: 'outdoor_shower', name: 'Outdoor shower', icon: ShowerHead },
];

const SAFETY_ITEMS = [
    { id: 'smoke_alarm', name: 'Smoke alarm', icon: Flame },
    { id: 'first_aid', name: 'First aid kit', icon: ShieldAlert },
    { id: 'fire_extinguisher', name: 'Fire extinguisher', icon: ShieldAlert },
    { id: 'carbon_monoxide', name: 'Carbon monoxide alarm', icon: Flame },
];

const MENA_ISO_CODES = ['MA', 'DZ', 'TN', 'EG', 'LY', 'SA', 'AE', 'QA', 'BH', 'KW', 'OM', 'JO', 'LB', 'PS', 'SY', 'IQ', 'YE'];
const MENA_COUNTRIES = Country.getAllCountries().filter(c => MENA_ISO_CODES.includes(c.isoCode));

export default function HostOnboardingPage() {
    const router = useRouter();
    const { user, token, setAuth } = useAuthStore();
    const currency = user?.preferred_currency || 'USD';
    
    const [step, setStep] = useState(2);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'rental', 
        property_type: '',
        privacy_type: '',
        address_country: 'Morocco',
        address_street: '',
        address_apt: '',
        address_city: '',
        address_province: '',
        address_postal_code: '',
        guests_count: 2,
        bedrooms_count: 1,
        beds_count: 1,
        bathrooms_count: 1,
        has_locks: false,
        amenities: [] as string[],
        safety_items: [] as string[],
        title: '',
        description: '',
        price: '',
        
        // Event specific
        start_datetime: '',
        end_datetime: '',
        venue_name: '',
        age_restriction: 'Family Friendly',
        is_waitlist_enabled: false,
        tickets: [{ name: '', price: '', quantity_available: 100, description: '' }]
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    
    const [selectedCountryCode, setSelectedCountryCode] = useState('MA');
    const [availableCities, setAvailableCities] = useState<any[]>([]);
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
    const [stepError, setStepError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize cities for Morocco ('MA')
        setAvailableCities(City.getCitiesOfCountry('MA') || []);
        
        // Read type from URL
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeParam = params.get('type');
            if (typeParam === 'experience') {
                setFormData(prev => ({ ...prev, type: 'tour' }));
                // Experiences logic (to be built later)
                setStep(4);
            } else if (typeParam === 'event') {
                setFormData(prev => ({ ...prev, type: 'event' }));
                // Event steps start at 101 to keep them completely separate from Rental logic
                setStep(101);
            }
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white flex-col">
                <p className="text-xl font-bold text-neutral-900 mb-4">Please log in to become a host.</p>
                <Link href="/login" className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600">
                    Log In
                </Link>
            </div>
        );
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedCountryCode(code);
        
        const countryData = Country.getCountryByCode(code);
        updateForm('address_country', countryData?.name || code);
        
        const newCities = City.getCitiesOfCountry(code) || [];
        setAvailableCities(newCities);
        updateForm('address_city', ''); // Reset city to force re-selection
        setMapCenter(null);
    };

    // Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const nextStep = () => {
        setStepError(null);

        if (step === 5 || step === 103) {
            // Validate distance
            const city = availableCities.find(c => c.name === formData.address_city);
            if (city && city.latitude && city.longitude && mapCenter) {
                const dist = calculateDistance(
                    parseFloat(city.latitude), parseFloat(city.longitude), 
                    mapCenter.lat, mapCenter.lng
                );
                
                if (dist > 15) { // 15 km allowed radius
                    setStepError(`The pin must be placed within ${formData.address_city}. You placed it ${dist.toFixed(1)} km away.`);
                    return;
                }
            }
        }

        setStep(s => {
            if (formData.type === 'event') {
                return s + 1; // 101 -> 106
            }
            
            const next = s + 1;
            if (formData.type !== 'rental' && formData.type !== 'event') {
                if (next === 2 || next === 3 || next === 6 || next === 7) {
                    if (s === 1) return 4;
                    if (s === 5) return 8;
                }
            }
            return next;
        });
    };
    
    const prevStep = () => {
        setStepError(null);
        if (step === 2 || step === 101 || (step === 4 && formData.type !== 'rental')) {
            router.back();
            return;
        }
        setStep(s => {
            if (formData.type === 'event') {
                return s - 1;
            }

            const prev = s - 1;
            if (formData.type !== 'rental' && formData.type !== 'event') {
                if (prev === 2 || prev === 3 || prev === 6 || prev === 7) {
                    if (s === 8) return 5;
                    if (s === 4) return 1;
                }
            }
            return prev;
        });
    };

    const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const updateCounter = (key: keyof typeof formData, increment: boolean) => {
        setFormData(prev => {
            const current = prev[key] as number;
            if (!increment && current <= (key === 'guests_count' ? 1 : 0)) return prev;
            return { ...prev, [key]: increment ? current + 1 : current - 1 };
        });
    };

    const getCityCenter = (): [number, number] => {
        if (mapCenter) return [mapCenter.lat, mapCenter.lng];
        const city = availableCities.find(c => c.name === formData.address_city);
        if (city && city.latitude && city.longitude) {
            return [parseFloat(city.latitude), parseFloat(city.longitude)];
        }
        return [33.5731, -7.5898]; // Casablanca default
    };

    const toggleArrayItem = (key: 'amenities' | 'safety_items', id: string) => {
        setFormData(prev => {
            const arr = prev[key];
            if (arr.includes(id)) {
                return { ...prev, [key]: arr.filter(a => a !== id) };
            }
            return { ...prev, [key]: [...arr, id] };
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
            setPhotoFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removePhoto = (index: number) => {
        // Revoke the blob URL to free memory
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveDraft = async () => {
        // Don't save draft if they haven't even picked a property type
        if (step <= 1) {
            router.back();
            return;
        }
        
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('is_draft', '1');
            fd.append('type', formData.type);
            
            if (formData.property_type) fd.append('property_type', formData.property_type);
            if (formData.privacy_type) fd.append('privacy_type', formData.privacy_type);
            if (formData.address_country) fd.append('address_country', formData.address_country);
            if (formData.address_street) fd.append('address_street', formData.address_street);
            if (formData.address_apt) fd.append('address_apt', formData.address_apt);
            if (formData.address_city) fd.append('address_city', formData.address_city);
            if (formData.address_province) fd.append('address_province', formData.address_province);
            if (formData.address_postal_code) fd.append('address_postal_code', formData.address_postal_code);
            
            let totalCapacity = formData.guests_count;
            let basePrice = String(parseFloat(formData.price) || 0);

            if (formData.type === 'event') {
                const ticketPrices = formData.tickets.map(t => Number(t.price) || 0);
                basePrice = ticketPrices.length > 0 ? String(Math.min(...ticketPrices)) : '0';
                totalCapacity = formData.tickets.reduce((sum, t) => sum + (Number(t.quantity_available) || 0), 0);
            }

            fd.append('currency', currency);
            fd.append('guests_count', String(totalCapacity));
            fd.append('bedrooms_count', String(formData.bedrooms_count));
            fd.append('beds_count', String(formData.beds_count));
            fd.append('bathrooms_count', String(formData.bathrooms_count));
            fd.append('has_locks', formData.has_locks ? '1' : '0');
            
            if (formData.title) fd.append('title', formData.title);
            if (formData.description) fd.append('description', formData.description);
            if (basePrice) fd.append('price', basePrice);

            if (mapCenter) {
                fd.append('latitude', String(mapCenter.lat));
                fd.append('longitude', String(mapCenter.lng));
            }

            if (formData.type === 'event') {
                if (formData.venue_name) fd.append('venue_name', formData.venue_name);
                if (formData.age_restriction) fd.append('age_restriction', formData.age_restriction);
                if (formData.start_datetime) fd.append('start_datetime', formData.start_datetime);
                if (formData.end_datetime) fd.append('end_datetime', formData.end_datetime);
                fd.append('is_waitlist_enabled', formData.is_waitlist_enabled ? '1' : '0');
                fd.append('tickets', JSON.stringify(formData.tickets));
            }

            fd.append('amenities', JSON.stringify(formData.amenities));
            fd.append('safety_items', JSON.stringify(formData.safety_items));

            photoFiles.forEach((file) => {
                fd.append('photos[]', file);
            });

            await api.post('/listings', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            router.push('/host/listings');
        } catch (err: any) {
            console.error("Draft Save Error:", err.response?.data || err);
            setStepError(err.response?.data?.message || "Failed to save draft. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStepError(null);
        try {
            const fd = new FormData();

            // Append all text/number fields
            fd.append('type', formData.type);
            fd.append('property_type', formData.property_type);
            fd.append('privacy_type', formData.privacy_type);
            fd.append('address_country', formData.address_country);
            fd.append('address_street', formData.address_street);
            fd.append('address_apt', formData.address_apt);
            fd.append('address_city', formData.address_city);
            fd.append('address_province', formData.address_province);
            fd.append('address_postal_code', formData.address_postal_code);

            let totalCapacity = formData.guests_count;
            let basePrice = String(parseFloat(formData.price) || 0);

            if (formData.type === 'event') {
                const ticketPrices = formData.tickets.map(t => Number(t.price) || 0);
                basePrice = ticketPrices.length > 0 ? String(Math.min(...ticketPrices)) : '0';
                totalCapacity = formData.tickets.reduce((sum, t) => sum + (Number(t.quantity_available) || 0), 0);
            }

            fd.append('currency', currency);
            fd.append('guests_count', String(totalCapacity));
            fd.append('bedrooms_count', String(formData.bedrooms_count));
            fd.append('beds_count', String(formData.beds_count));
            fd.append('bathrooms_count', String(formData.bathrooms_count));
            fd.append('has_locks', formData.has_locks ? '1' : '0');
            fd.append('title', formData.title);
            fd.append('description', formData.description);
            fd.append('price', basePrice);

            const center = getCityCenter();
            fd.append('latitude', String(center[0]));
            fd.append('longitude', String(center[1]));

            if (formData.type === 'event') {
                fd.append('venue_name', formData.venue_name);
                fd.append('age_restriction', formData.age_restriction);
                fd.append('start_datetime', formData.start_datetime);
                fd.append('end_datetime', formData.end_datetime);
                fd.append('is_waitlist_enabled', formData.is_waitlist_enabled ? '1' : '0');
                fd.append('tickets', JSON.stringify(formData.tickets));
            }

            // Arrays must be sent as JSON strings (FormData limitation)
            fd.append('amenities', JSON.stringify(formData.amenities));
            fd.append('safety_items', JSON.stringify(formData.safety_items));

            // Append actual photo files
            photoFiles.forEach((file) => {
                fd.append('photos[]', file);
            });

            const res = await api.post('/listings', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (res.data && res.data.data) {
                setAuth(res.data.data.user, token!);
                router.push('/host/listings');
            }
        } catch (err: any) {
            console.error("Submission Error:", err.response?.data || err);
            
            if (err.response?.status >= 500) {
                setStepError("An unexpected server error occurred. Our technical team has been notified.");
            } else if (err.response?.data?.errors) {
                // Extract the first Laravel validation error
                const firstErrorKey = Object.keys(err.response.data.errors)[0];
                const firstErrorMessage = err.response.data.errors[firstErrorKey][0];
                setStepError(firstErrorMessage);
            } else {
                setStepError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isNextDisabled = () => {
        if (formData.type === 'event') {
            if (step === 101 && (!formData.title || !formData.property_type || !formData.description)) return true;
            if (step === 102 && (!formData.venue_name || !formData.address_city)) return true;
            if (step === 104) {
                if (!formData.start_datetime || !formData.end_datetime) return true;
                const start = new Date(formData.start_datetime).getTime();
                const end = new Date(formData.end_datetime).getTime();
                const now = new Date().getTime();
                // Prevent past dates and end dates before start dates
                if (start < now || end <= start) return true;
            }
            if (step === 105 && formData.tickets.some(t => !t.name || !t.price)) return true;
            if (step === 106 && previewUrls.length === 0) return true;
            return false;
        }

        if (step === 2 && !formData.property_type) return true;
        if (step === 3 && !formData.privacy_type) return true;
        if (step === 4 && (!formData.address_street || !formData.address_city)) return true;
        if (step === 8 && previewUrls.length < 5) return true; 
        if (step === 9 && !formData.title) return true;
        if (step === 10 && !formData.description) return true;
        if (step === 11 && !formData.price) return true;
        return false;
    };

    const isEvent = formData.type === 'event';
    const TOTAL_STEPS = isEvent ? 6 : 11;
    const currentStepIndex = isEvent ? step - 100 : step;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            
            {/* Header */}
            <header className="h-20 border-b border-neutral-100 flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-50">
                <Link href="/host/dashboard" className="text-2xl font-black text-amber-500 tracking-tight">Wijha</Link>
                <button 
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="text-sm font-bold text-neutral-500 hover:text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save & exit'}
                </button>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 h-1.5 relative z-40">
                <div 
                    className="bg-neutral-900 h-1.5 transition-all duration-500 ease-out" 
                    style={{ width: `${(currentStepIndex / TOTAL_STEPS) * 100}%` }}
                ></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 pb-32">
                <div className="w-full max-w-3xl">
                    {/* Global Step Error */}
                    <AnimatePresence>
                        {stepError && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-medium flex items-center gap-3 shadow-sm"
                            >
                                <ShieldAlert size={24} className="shrink-0" />
                                <p>{stepError}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {/* STEP 1 REMOVED: Handled by Dashboard Modal */}

                        {/* STEP 2: Property Type */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight text-center sm:text-left">
                                    Which of these best describes your place?
                                </h1>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {PROPERTY_TYPES.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => updateForm('property_type', item.id)}
                                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-start hover:shadow-md ${formData.property_type === item.id ? 'border-neutral-900 bg-neutral-50 shadow-md' : 'border-neutral-200 hover:border-neutral-900'}`}
                                        >
                                            <item.icon size={32} className={`mb-3 ${formData.property_type === item.id ? 'text-neutral-900' : 'text-neutral-600'}`} />
                                            <h3 className="text-sm font-bold text-neutral-900">{item.label}</h3>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Privacy Type */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    What type of place will guests have?
                                </h1>
                                <div className="space-y-4">
                                    {PRIVACY_TYPES.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => updateForm('privacy_type', item.id)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center hover:shadow-md ${formData.privacy_type === item.id ? 'border-neutral-900 bg-neutral-50 shadow-md' : 'border-neutral-200 hover:border-neutral-900'}`}
                                        >
                                            <div>
                                                <h3 className="text-xl font-bold text-neutral-900 mb-1">{item.label}</h3>
                                                <p className="text-neutral-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Address Form */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight text-center">
                                    Confirm your address
                                </h1>
                                <p className="text-lg text-neutral-500 text-center">Your exact address won't be shared with guests until they book.</p>
                                
                                <div className="space-y-4">
                                    <div className="border border-neutral-300 rounded-2xl overflow-hidden focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
                                        <div className="p-4 border-b border-neutral-300 bg-neutral-50/50">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Country / Region</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedCountryCode}
                                                    onChange={handleCountryChange}
                                                    className="w-full bg-transparent text-lg font-bold text-neutral-900 outline-none appearance-none cursor-pointer pr-8"
                                                >
                                                    {MENA_COUNTRIES.map((c) => (
                                                        <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                    <ChevronRight size={20} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border-b border-neutral-300 relative group">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Street address</label>
                                            <input 
                                                type="text" placeholder="e.g. 123 Main St" 
                                                value={formData.address_street} onChange={(e) => updateForm('address_street', e.target.value)}
                                                className="w-full text-lg font-medium text-neutral-900 placeholder-neutral-300 outline-none"
                                            />
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Apt, floor, bldg (optional)</label>
                                            <input 
                                                type="text" placeholder="e.g. Apt 4B" 
                                                value={formData.address_apt} onChange={(e) => updateForm('address_apt', e.target.value)}
                                                className="w-full text-lg font-medium text-neutral-900 placeholder-neutral-300 outline-none"
                                            />
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">City / town</label>
                                            <div className="relative">
                                                <select 
                                                    value={formData.address_city}
                                                    onChange={(e) => {
                                                        updateForm('address_city', e.target.value);
                                                        setMapCenter(null); // Reset pin when city changes
                                                    }}
                                                    className="w-full text-lg font-medium text-neutral-900 bg-transparent outline-none appearance-none cursor-pointer pr-8"
                                                >
                                                    <option value="" disabled>Select a city</option>
                                                    {availableCities.map((city, idx) => (
                                                        <option key={`${city.name}-${idx}`} value={city.name}>{city.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                                    <ChevronRight size={20} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Province / state</label>
                                            <input 
                                                type="text" placeholder="e.g. Marrakech-Safi" 
                                                value={formData.address_province} onChange={(e) => updateForm('address_province', e.target.value)}
                                                className="w-full text-lg font-medium text-neutral-900 placeholder-neutral-300 outline-none"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Postal code</label>
                                            <input 
                                                type="text" placeholder="e.g. 40000" 
                                                value={formData.address_postal_code} onChange={(e) => updateForm('address_postal_code', e.target.value)}
                                                className="w-full text-lg font-medium text-neutral-900 placeholder-neutral-300 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Map Pin */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 h-full flex flex-col max-w-2xl mx-auto">
                                <div className="text-center">
                                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                        Is the pin in the right spot?
                                    </h1>
                                    <p className="text-lg text-neutral-500 mt-2">Your address is only shared with guests after they've made a reservation.</p>
                                </div>
                                
                                <div ref={mapRef} className="w-full min-h-[500px] bg-[#E8F0F2] rounded-3xl relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 w-full h-full">
                                        <InteractiveMap 
                                            center={getCityCenter()} 
                                            onMoveEnd={(lat, lng) => setMapCenter({ lat, lng })}
                                        />
                                    </div>
                                    
                                    {/* UI Match of Screenshot: Fixed pin, drag the map beneath it */}
                                    <div className="relative z-10 flex flex-col items-center pointer-events-none mb-14">
                                        <div className="bg-white/95 backdrop-blur rounded-full px-6 py-3 shadow-lg flex items-center gap-3 relative border border-neutral-100">
                                            <span className="font-bold text-neutral-900 text-[15px] pl-2 pr-10">Drag the map to reposition the pin</span>
                                            
                                            {/* The Black Circle Pin overlapping the pill */}
                                            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 flex flex-col items-center cursor-move hover:scale-105 transition-transform">
                                                <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                                                    <Home size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* The small black dot below */}
                                        <div className="w-2 h-2 bg-neutral-900 rounded-full mt-4 shadow-sm translate-x-14"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Floor Plan / Basics */}
                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Let's start with the basics
                                </h1>

                                <div className="space-y-2">
                                    {[
                                        { id: 'guests_count', label: 'Guests' },
                                        { id: 'bedrooms_count', label: 'Bedrooms' },
                                        { id: 'beds_count', label: 'Beds' },
                                        { id: 'bathrooms_count', label: 'Bathrooms' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-6 border-b border-neutral-100">
                                            <span className="text-xl text-neutral-900">{item.label}</span>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => updateCounter(item.id as any, false)}
                                                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:hover:border-neutral-300 disabled:cursor-not-allowed"
                                                    disabled={(formData as any)[item.id] <= (item.id === 'guests_count' ? 1 : 0)}
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <span className="text-xl w-6 text-center">{(formData as any)[item.id]}</span>
                                                <button 
                                                    onClick={() => updateCounter(item.id as any, true)}
                                                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-8">
                                        <h3 className="text-xl text-neutral-900 mb-6">Does every bedroom have a lock?</h3>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => updateForm('has_locks', true)}
                                                className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${formData.has_locks === true ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-900 hover:border-neutral-900'}`}
                                            >Yes</button>
                                            <button 
                                                onClick={() => updateForm('has_locks', false)}
                                                className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${formData.has_locks === false ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-900 hover:border-neutral-900'}`}
                                            >No</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Amenities & Safety */}
                        {step === 7 && (
                            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <div>
                                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-2">
                                        Tell guests what your place has to offer
                                    </h1>
                                    <p className="text-lg text-neutral-500 mb-8">You can add more amenities after you publish your listing.</p>
                                    
                                    <h2 className="text-xl font-bold text-neutral-900 mb-4">What about these guest favorites?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {GUEST_FAVORITES.map((amenity) => {
                                            const isSelected = formData.amenities.includes(amenity.id);
                                            return (
                                                <div 
                                                    key={amenity.id}
                                                    onClick={() => toggleArrayItem('amenities', amenity.id)}
                                                    className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-start hover:shadow-md ${isSelected ? 'border-neutral-900 bg-neutral-50 shadow-md' : 'border-neutral-200 hover:border-neutral-900'}`}
                                                >
                                                    <amenity.icon size={28} strokeWidth={1.5} className={`mb-3 ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}`} />
                                                    <h3 className="text-[15px] font-bold text-neutral-900">{amenity.name}</h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Do you have any standout amenities?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {STANDOUT_AMENITIES.map((amenity) => {
                                            const isSelected = formData.amenities.includes(amenity.id);
                                            return (
                                                <div 
                                                    key={amenity.id}
                                                    onClick={() => toggleArrayItem('amenities', amenity.id)}
                                                    className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-start hover:shadow-md ${isSelected ? 'border-neutral-900 bg-neutral-50 shadow-md' : 'border-neutral-200 hover:border-neutral-900'}`}
                                                >
                                                    <amenity.icon size={28} strokeWidth={1.5} className={`mb-3 ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}`} />
                                                    <h3 className="text-[15px] font-bold text-neutral-900">{amenity.name}</h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Do you have any of these safety items?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {SAFETY_ITEMS.map((item) => {
                                            const isSelected = formData.safety_items.includes(item.id);
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => toggleArrayItem('safety_items', item.id)}
                                                    className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-start hover:shadow-md ${isSelected ? 'border-neutral-900 bg-neutral-50 shadow-md' : 'border-neutral-200 hover:border-neutral-900'}`}
                                                >
                                                    <item.icon size={28} strokeWidth={1.5} className={`mb-3 ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}`} />
                                                    <h3 className="text-[15px] font-bold text-neutral-900">{item.name}</h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 8: Photos */}
                        {step === 8 && (
                            <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight text-center sm:text-left">
                                    Add some photos of your house
                                </h1>
                                <p className="text-lg text-neutral-500 text-center sm:text-left">
                                    You'll need <strong className="text-neutral-900">5 photos</strong> to get started. You can add more or make changes later.
                                    <br />
                                    <span className="text-sm font-medium">({previewUrls.length} / 5 photos selected)</span>
                                </p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Upload Button */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="col-span-2 sm:col-span-1 h-64 border-2 border-dashed border-neutral-300 bg-neutral-50/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all group"
                                    >
                                        <UploadCloud size={48} className="text-neutral-400 mb-4 group-hover:text-neutral-900 transition-colors" />
                                        <span className="font-bold text-neutral-900 text-lg">Upload Photos</span>
                                        <span className="text-sm text-neutral-500 mt-1">Drag and drop or click</span>
                                    </div>
                                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />

                                    {/* Photo Previews */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="h-64 rounded-3xl overflow-hidden relative group border border-neutral-200 shadow-sm">
                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            {/* Beautiful remove button */}
                                            <button 
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-900 shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Empty placeholders to encourage 5 photos */}
                                    {Array.from({ length: Math.max(0, 4 - previewUrls.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-64 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/30"></div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 9: Title */}
                        {step === 9 && (
                            <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Now, let's give your house a title
                                </h1>
                                <p className="text-lg text-neutral-500">Short titles work best. Have fun with it—you can always change it later.</p>
                                
                                <textarea 
                                    rows={4}
                                    placeholder="e.g. Stunning Riad with Pool in Medina" 
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                    className="w-full p-6 text-2xl rounded-3xl border-2 border-neutral-300 bg-white font-bold text-neutral-900 focus:border-neutral-900 outline-none transition-all resize-none shadow-sm"
                                />
                            </motion.div>
                        )}

                        {/* STEP 10: Description */}
                        {step === 10 && (
                            <motion.div key="step10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Create your description
                                </h1>
                                <p className="text-lg text-neutral-500">Share what makes your place special.</p>
                                
                                <textarea 
                                    rows={6}
                                    placeholder="Describe your property..." 
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    className="w-full p-6 text-xl rounded-3xl border-2 border-neutral-300 bg-white font-medium text-neutral-900 focus:border-neutral-900 outline-none transition-all resize-none shadow-sm"
                                />
                            </motion.div>
                        )}

                        {/* STEP 11: Pricing */}
                        {step === 11 && (
                            <motion.div key="step11" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Now, set your price
                                </h1>
                                <p className="text-lg text-neutral-500">You can change it anytime.</p>

                                <div className="flex items-center justify-center py-12">
                                    <div className="relative border-b-2 border-transparent focus-within:border-neutral-900 transition-all w-full flex justify-center pb-2">
                                        <span className="absolute left-[10%] sm:left-[20%] top-1/2 -translate-y-1/2 text-5xl sm:text-6xl font-black text-neutral-300">{currency}</span>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => updateForm('price', e.target.value)}
                                            className="w-full pl-[100px] sm:pl-[140px] py-4 text-6xl sm:text-7xl font-black text-neutral-900 bg-transparent border-0 focus:ring-0 outline-none text-center placeholder-neutral-200"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* EVENT STEP 101: Identity */}
                        {step === 101 && (
                            <motion.div key="step101" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Let&apos;s define your Event
                                </h1>
                                <p className="text-lg text-neutral-500">Give your event a catchy title and clear description.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Event Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Desert Rhythms Festival" 
                                            value={formData.title}
                                            onChange={(e) => updateForm('title', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-2">Category</label>
                                            <select 
                                                value={formData.property_type}
                                                onChange={(e) => updateForm('property_type', e.target.value)}
                                                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none bg-white"
                                            >
                                                <option value="" disabled>Select category...</option>
                                                <option value="music">Live Music</option>
                                                <option value="workshop">Workshop</option>
                                                <option value="networking">Networking</option>
                                                <option value="nightlife">Nightlife</option>
                                                <option value="art">Art & Culture</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-2">Age Limit</label>
                                            <select 
                                                value={formData.age_restriction}
                                                onChange={(e) => updateForm('age_restriction', e.target.value)}
                                                className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none bg-white"
                                            >
                                                <option value="Family Friendly">Family Friendly</option>
                                                <option value="16+">16+</option>
                                                <option value="18+">18+</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Description</label>
                                        <textarea 
                                            rows={4}
                                            placeholder="What should guests expect?" 
                                            value={formData.description}
                                            onChange={(e) => updateForm('description', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* EVENT STEP 102: Location */}
                        {step === 102 && (
                            <motion.div key="step102" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">Where is the event?</h1>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Venue Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. The Grand Riad Courtyard" 
                                            value={formData.venue_name}
                                            onChange={(e) => updateForm('venue_name', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Country</label>
                                        <select 
                                            value={selectedCountryCode}
                                            onChange={handleCountryChange}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 bg-white"
                                        >
                                            {MENA_COUNTRIES.map(c => (
                                                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">City</label>
                                        <select 
                                            value={formData.address_city}
                                            onChange={(e) => updateForm('address_city', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 bg-white"
                                        >
                                            <option value="" disabled>Select a city</option>
                                            {availableCities.map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Exact Street Address</label>
                                        <input 
                                            type="text" 
                                            placeholder="123 Medina St" 
                                            value={formData.address_street}
                                            onChange={(e) => updateForm('address_street', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* EVENT STEP 103: Map Pin */}
                        {step === 103 && (
                            <motion.div key="step103" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 w-full max-w-4xl mx-auto h-[60vh] flex flex-col">
                                <div className="text-center">
                                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight leading-tight mb-2">Pin the venue</h1>
                                    <p className="text-lg text-neutral-500">Drag the map to pinpoint the exact entrance.</p>
                                </div>
                                <div className="flex-1 rounded-3xl overflow-hidden shadow-sm border border-neutral-200 relative bg-neutral-100" ref={mapRef}>
                                    <InteractiveMap 
                                        center={getCityCenter()}
                                        onMoveEnd={(lat, lng) => setMapCenter({lat, lng})}
                                    />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pb-2 z-10 pointer-events-none drop-shadow-xl text-amber-500 flex flex-col items-center">
                                        <div className="bg-amber-500 text-white font-bold px-3 py-1 rounded-full shadow-md text-sm mb-1">
                                            {formData.venue_name || 'Venue'}
                                        </div>
                                        <MapPin size={48} fill="currentColor" className="text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* EVENT STEP 104: Schedule */}
                        {step === 104 && (
                            <motion.div key="step104" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-xl mx-auto w-full">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    When is it happening?
                                </h1>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Doors Open (Start Time)</label>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.start_datetime}
                                            min={new Date().toISOString().slice(0, 16)}
                                            onChange={(e) => updateForm('start_datetime', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Event Ends (End Time)</label>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.end_datetime}
                                            min={formData.start_datetime || new Date().toISOString().slice(0, 16)}
                                            onChange={(e) => updateForm('end_datetime', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-900 outline-none bg-white"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* EVENT STEP 105: Ticketing */}
                        {step === 105 && (
                            <motion.div key="step105" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto w-full">
                                <div>
                                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-2">
                                        Ticketing & Waitlist
                                    </h1>
                                    <p className="text-lg text-neutral-500">Define your ticket tiers and enable the smart waitlist.</p>
                                </div>

                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-neutral-900">Smart Waitlist</h3>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={formData.is_waitlist_enabled} onChange={(e) => updateForm('is_waitlist_enabled', e.target.checked)} />
                                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                            </label>
                                        </div>
                                        <p className="text-sm text-neutral-600">If enabled, when tickets sell out, users can join a waitlist. If someone cancels, the ticket is auto-offered to the next person in line.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-xl">Ticket Tiers</h3>
                                        <button 
                                            onClick={() => updateForm('tickets', [...formData.tickets, { name: '', price: '', quantity_available: 50, description: '' }])}
                                            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Add Tier
                                        </button>
                                    </div>
                                    
                                    {formData.tickets.map((ticket, index) => (
                                        <div key={index} className="p-5 border-2 border-neutral-200 rounded-2xl space-y-4 bg-white relative">
                                            {formData.tickets.length > 1 && (
                                                <button onClick={() => updateForm('tickets', formData.tickets.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500">
                                                    <X size={20} />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Tier Name</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. VIP Access"
                                                        value={ticket.name}
                                                        onChange={(e) => {
                                                            const newTickets = [...formData.tickets];
                                                            newTickets[index].name = e.target.value;
                                                            updateForm('tickets', newTickets);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Price ({currency})</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="e.g. 150 (0 for Free)"
                                                        value={ticket.price}
                                                        onChange={(e) => {
                                                            const newTickets = [...formData.tickets];
                                                            newTickets[index].price = e.target.value;
                                                            updateForm('tickets', newTickets);
                                                        }}
                                                        className="w-full p-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Quantity Available</label>
                                                    <div className="flex items-center gap-4 border border-neutral-200 p-2 rounded-xl w-max">
                                                        <button 
                                                            onClick={() => {
                                                                const newTickets = [...formData.tickets];
                                                                if (newTickets[index].quantity_available > 1) newTickets[index].quantity_available -= 1;
                                                                updateForm('tickets', newTickets);
                                                            }}
                                                            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:border-neutral-900"
                                                        ><Minus size={16}/></button>
                                                        <span className="w-12 text-center font-bold">{ticket.quantity_available}</span>
                                                        <button 
                                                            onClick={() => {
                                                                const newTickets = [...formData.tickets];
                                                                newTickets[index].quantity_available += 1;
                                                                updateForm('tickets', newTickets);
                                                            }}
                                                            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:border-neutral-900"
                                                        ><Plus size={16}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* EVENT STEP 106: Media & Validation */}
                        {step === 106 && (
                            <motion.div key="step106" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-3xl mx-auto w-full">
                                <div className="text-center">
                                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-2">
                                        Upload the Event Poster
                                    </h1>
                                    <p className="text-lg text-neutral-500">Add 1 poster (or multiple photos) to make your event stand out.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {previewUrls.map((url, i) => (
                                        <div key={i} className={`relative rounded-2xl overflow-hidden border-2 border-neutral-100 group ${i === 0 ? 'col-span-2 md:col-span-3 aspect-[21/9]' : 'aspect-square'}`}>
                                            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                            {i === 0 && (
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                    Main Poster
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 hover:border-neutral-900 hover:bg-neutral-50 transition-all ${previewUrls.length === 0 ? 'col-span-2 md:col-span-3 aspect-[21/9]' : 'aspect-square'}`}
                                    >
                                        <UploadCloud size={previewUrls.length === 0 ? 48 : 24} className="text-neutral-400" />
                                        <span className="text-neutral-600 font-medium">{previewUrls.length === 0 ? 'Click to upload main poster' : 'Add more'}</span>
                                    </button>
                                </div>
                                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                                
                                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 mt-8">
                                    <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                                        <ShieldAlert size={20} className="text-amber-500" /> Trust & Verification
                                    </h3>
                                    <p className="text-sm text-neutral-600">
                                        When you publish this event, it will go into a <strong>Pending Review</strong> state. Our admins will verify the details before tickets go on sale to ensure platform safety. Your payout will be secured in Escrow until the event finishes successfully.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="h-24 border-t border-neutral-200 bg-white flex items-center justify-between px-4 sm:px-8 max-w-[1440px] mx-auto w-full fixed bottom-0 z-50">
                <div className="flex-1">
                    {currentStepIndex > 1 && (
                        <button 
                            onClick={prevStep}
                            className="px-6 py-3 rounded-full font-bold text-neutral-900 underline hover:bg-neutral-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                </div>
                <div className="flex-1 flex justify-end">
                    {currentStepIndex < TOTAL_STEPS ? (
                        <button 
                            onClick={nextStep}
                            disabled={isNextDisabled()}
                            className="px-10 py-4 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || isNextDisabled()}
                            className="px-10 py-4 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                <>Publish Listing <CheckCircle2 size={20} /></>
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
