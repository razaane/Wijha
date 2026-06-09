"use client";

import { useState, useRef } from 'react';
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

export default function HostOnboardingPage() {
    const router = useRouter();
    const { user, token, setAuth } = useAuthStore();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: '', 
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
        photos: [] as string[],
        title: '',
        description: '',
        price: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

    const nextStep = () => {
        if (step === 1 && formData.type !== 'rental') {
            alert('Tour and Event creation is coming soon! Please select Rental for now.');
            return;
        }
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const updateCounter = (key: keyof typeof formData, increment: boolean) => {
        setFormData(prev => {
            const current = prev[key] as number;
            if (!increment && current <= (key === 'guests_count' ? 1 : 0)) return prev;
            return { ...prev, [key]: increment ? current + 1 : current - 1 };
        });
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
            setPreviewUrls([...previewUrls, ...newUrls]);
        }
    };

    const removePhoto = (index: number) => {
        const newUrls = [...previewUrls];
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                photos: [] // Mocked for MVP
            };

            const res = await api.post('/listings', payload);
            
            if (res.data && res.data.data) {
                setAuth(res.data.data.user, token!);
                router.push('/dashboard?host=true');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isNextDisabled = () => {
        if (step === 1 && !formData.type) return true;
        if (step === 2 && !formData.property_type) return true;
        if (step === 3 && !formData.privacy_type) return true;
        if (step === 4 && (!formData.address_street || !formData.address_city)) return true;
        if (step === 8 && previewUrls.length < 5) return true; 
        if (step === 9 && !formData.title) return true;
        if (step === 10 && !formData.description) return true;
        if (step === 11 && !formData.price) return true;
        return false;
    };

    const TOTAL_STEPS = 11;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            
            {/* Header */}
            <header className="h-20 border-b border-neutral-100 flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-50">
                <Link href="/host" className="text-2xl font-black text-amber-500 tracking-tight">Wijha</Link>
                <Link href="/host" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors">
                    Save & exit
                </Link>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 h-1.5">
                <div 
                    className="bg-neutral-900 h-1.5 transition-all duration-500 ease-out" 
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                ></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 pb-32">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: Main Type */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    What would you like to host?
                                </h1>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {TYPES.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => updateForm('type', item.id)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.type === item.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-900'}`}
                                        >
                                            <item.icon size={32} className={`mb-4 ${formData.type === item.id ? 'text-neutral-900' : 'text-neutral-600'}`} />
                                            <h3 className="text-lg font-bold text-neutral-900">{item.label}</h3>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                                            <select 
                                                value={formData.address_country}
                                                onChange={(e) => updateForm('address_country', e.target.value)}
                                                className="w-full bg-transparent text-lg font-bold text-neutral-900 outline-none appearance-none"
                                            >
                                                <option>Morocco</option>
                                                <option>France</option>
                                                <option>Spain</option>
                                            </select>
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
                                            <input 
                                                type="text" placeholder="e.g. Marrakech" 
                                                value={formData.address_city} onChange={(e) => updateForm('address_city', e.target.value)}
                                                className="w-full text-lg font-medium text-neutral-900 placeholder-neutral-300 outline-none"
                                            />
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
                                
                                <div className="w-full min-h-[500px] bg-[#E8F0F2] rounded-3xl relative overflow-hidden flex items-center justify-center">
                                    {/* Clean Map Mockup Background */}
                                    <div className="absolute inset-0 opacity-60 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=33.5731,-7.5898&zoom=15&size=800x600&sensor=false&style=feature:all|element:labels|visibility:off')] bg-cover bg-center mix-blend-multiply"></div>
                                    
                                    {/* UI Match of Screenshot: Drag the map pill + pin */}
                                    <div className="relative z-10 flex flex-col items-center">
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
                                                <span className="text-xl w-6 text-center">{formData[item.id as keyof typeof formData]}</span>
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
                                        <span className="absolute left-[10%] sm:left-[20%] top-1/2 -translate-y-1/2 text-5xl sm:text-6xl font-black text-neutral-300">MAD</span>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => updateForm('price', e.target.value)}
                                            className="w-full pl-[100px] sm:pl-[140px] py-4 text-6xl sm:text-7xl font-black text-neutral-900 bg-transparent border-0 focus:ring-0 outline-none text-center placeholder-neutral-200"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">
                                        {error}
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="h-24 border-t border-neutral-200 bg-white flex items-center justify-between px-4 sm:px-8 max-w-[1440px] mx-auto w-full fixed bottom-0 z-50">
                <div className="flex-1">
                    {step > 1 && (
                        <button 
                            onClick={prevStep}
                            className="px-6 py-3 rounded-full font-bold text-neutral-900 underline hover:bg-neutral-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                </div>
                <div className="flex-1 flex justify-end">
                    {step < TOTAL_STEPS ? (
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
