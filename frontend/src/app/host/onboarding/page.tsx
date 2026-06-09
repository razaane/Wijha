"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Home, MapPin, 
    Loader2, Sparkles, Map as MapIcon, Ticket, 
    Wifi, Tv, Car, Coffee, Wind, UploadCloud, X, CheckCircle2,
    Building2, Tent, Caravan, Castle, Anchor, Flame, ShieldAlert,
    Plus, Minus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

// --- Constants ---
const PROPERTY_TYPES = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building2 },
    { id: 'barn', label: 'Barn', icon: Home },
    { id: 'boat', label: 'Boat', icon: Anchor },
    { id: 'cabin', label: 'Cabin', icon: Home },
    { id: 'camper', label: 'Camper/RV', icon: Caravan },
    { id: 'castle', label: 'Castle', icon: Castle },
    { id: 'tent', label: 'Tent', icon: Tent },
];

const PRIVACY_TYPES = [
    { id: 'entire_place', label: 'An entire place', desc: 'Guests have the whole place to themselves.' },
    { id: 'private_room', label: 'A room', desc: 'Guests have their own room, plus access to shared spaces.' },
    { id: 'shared_room', label: 'A shared room', desc: 'Guests sleep in a room or common area that may be shared.' },
];

const AMENITIES_LIST = [
    { id: 'wifi', name: 'Fast WiFi', icon: Wifi },
    { id: 'tv', name: 'Smart TV', icon: Tv },
    { id: 'parking', name: 'Free Parking', icon: Car },
    { id: 'kitchen', name: 'Kitchen', icon: Coffee },
    { id: 'ac', name: 'Air Conditioning', icon: Wind },
];

const SAFETY_ITEMS = [
    { id: 'smoke_alarm', name: 'Smoke alarm', icon: Flame },
    { id: 'first_aid', name: 'First aid kit', icon: ShieldAlert },
    { id: 'fire_extinguisher', name: 'Fire extinguisher', icon: ShieldAlert },
];

export default function HostOnboardingPage() {
    const router = useRouter();
    const { user, token, setAuth } = useAuthStore();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: 'rental', // Hardcoded for this specific flow
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

    // Photos state
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

    const nextStep = () => setStep(s => s + 1);
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
        if (step === 1 && !formData.property_type) return true;
        if (step === 2 && !formData.privacy_type) return true;
        if (step === 3 && (!formData.address_street || !formData.address_city)) return true;
        // Step 4 is map, no validation needed
        // Step 5 is counters, always valid
        // Step 6 is amenities, optional
        if (step === 7 && previewUrls.length === 0) return true;
        if (step === 8 && !formData.title) return true;
        if (step === 9 && !formData.description) return true;
        if (step === 10 && !formData.price) return true;
        return false;
    };

    const TOTAL_STEPS = 10;

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
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: Property Type */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Which of these best describes your place?
                                </h1>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {PROPERTY_TYPES.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => updateForm('property_type', item.id)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.property_type === item.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-900'}`}
                                        >
                                            <item.icon size={32} className={`mb-4 ${formData.property_type === item.id ? 'text-neutral-900' : 'text-neutral-600'}`} />
                                            <h3 className="text-lg font-bold text-neutral-900">{item.label}</h3>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Privacy Type */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    What type of place will guests have?
                                </h1>
                                <div className="space-y-4">
                                    {PRIVACY_TYPES.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => updateForm('privacy_type', item.id)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center ${formData.privacy_type === item.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-900'}`}
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

                        {/* STEP 3: Address Form */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Confirm your address
                                </h1>
                                <p className="text-lg text-neutral-500">Your exact address won't be shared with guests until they book.</p>
                                
                                <div className="space-y-4">
                                    <div className="border border-neutral-300 rounded-2xl overflow-hidden">
                                        <div className="p-4 border-b border-neutral-300 bg-neutral-50">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Country / Region</label>
                                            <select 
                                                value={formData.address_country}
                                                onChange={(e) => updateForm('address_country', e.target.value)}
                                                className="w-full bg-transparent font-bold text-neutral-900 outline-none appearance-none"
                                            >
                                                <option>Morocco</option>
                                                <option>France</option>
                                                <option>Spain</option>
                                            </select>
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <input 
                                                type="text" placeholder="Street address" 
                                                value={formData.address_street} onChange={(e) => updateForm('address_street', e.target.value)}
                                                className="w-full font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                                            />
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <input 
                                                type="text" placeholder="Apt, floor, bldg (if applicable)" 
                                                value={formData.address_apt} onChange={(e) => updateForm('address_apt', e.target.value)}
                                                className="w-full font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                                            />
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <input 
                                                type="text" placeholder="City / town / village" 
                                                value={formData.address_city} onChange={(e) => updateForm('address_city', e.target.value)}
                                                className="w-full font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                                            />
                                        </div>
                                        <div className="p-4 border-b border-neutral-300">
                                            <input 
                                                type="text" placeholder="Province / state (if applicable)" 
                                                value={formData.address_province} onChange={(e) => updateForm('address_province', e.target.value)}
                                                className="w-full font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <input 
                                                type="text" placeholder="Postal code (if applicable)" 
                                                value={formData.address_postal_code} onChange={(e) => updateForm('address_postal_code', e.target.value)}
                                                className="w-full font-medium text-neutral-900 placeholder-neutral-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Map Pin */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 h-full flex flex-col">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Is the pin in the right spot?
                                </h1>
                                <p className="text-lg text-neutral-500">Your address is only shared with guests after they've made a reservation.</p>
                                
                                <div className="flex-1 w-full h-[400px] bg-neutral-100 rounded-3xl relative overflow-hidden flex items-center justify-center border border-neutral-200">
                                    {/* Map Mockup Background */}
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=33.5731,-7.5898&zoom=15&size=800x600&sensor=false')] bg-cover bg-center mix-blend-luminosity"></div>
                                    
                                    {/* Draggable Pin Mockup */}
                                    <div className="relative z-10 flex flex-col items-center cursor-pointer animate-bounce">
                                        <div className="bg-neutral-900 text-white px-4 py-2 rounded-full font-bold shadow-xl mb-2 flex items-center gap-2">
                                            <Home size={16} /> <span>Drag map to adjust</span>
                                        </div>
                                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="w-2 h-2 bg-neutral-900 rounded-full mt-1"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Floor Plan / Basics */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Let's start with the basics
                                </h1>
                                <p className="text-lg text-neutral-500">How many people can stay here?</p>

                                <div className="space-y-6">
                                    {[
                                        { id: 'guests_count', label: 'Guests' },
                                        { id: 'bedrooms_count', label: 'Bedrooms' },
                                        { id: 'beds_count', label: 'Beds' },
                                        { id: 'bathrooms_count', label: 'Bathrooms' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-4 border-b border-neutral-100">
                                            <span className="text-xl text-neutral-900">{item.label}</span>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => updateCounter(item.id as any, false)}
                                                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-30"
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
                                    
                                    <div className="pt-6">
                                        <h3 className="text-xl text-neutral-900 mb-4">Does every bedroom have a lock?</h3>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => updateForm('has_locks', true)}
                                                className={`px-8 py-3 rounded-full border-2 font-bold transition-all ${formData.has_locks === true ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-900 hover:border-neutral-900'}`}
                                            >Yes</button>
                                            <button 
                                                onClick={() => updateForm('has_locks', false)}
                                                className={`px-8 py-3 rounded-full border-2 font-bold transition-all ${formData.has_locks === false ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-900 hover:border-neutral-900'}`}
                                            >No</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Amenities & Safety */}
                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <div>
                                    <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-4">
                                        Tell guests what your place has to offer
                                    </h1>
                                    <p className="text-lg text-neutral-500 mb-6">Do you have any standout amenities?</p>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {AMENITIES_LIST.map((amenity) => {
                                            const isSelected = formData.amenities.includes(amenity.id);
                                            return (
                                                <div 
                                                    key={amenity.id}
                                                    onClick={() => toggleArrayItem('amenities', amenity.id)}
                                                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-start ${isSelected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-900'}`}
                                                >
                                                    <amenity.icon size={32} className={`mb-4 ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                                    <h3 className="text-lg font-bold text-neutral-900">{amenity.name}</h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Do you have any of these safety items?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {SAFETY_ITEMS.map((item) => {
                                            const isSelected = formData.safety_items.includes(item.id);
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => toggleArrayItem('safety_items', item.id)}
                                                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-start ${isSelected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-900'}`}
                                                >
                                                    <item.icon size={32} className={`mb-4 ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                                    <h3 className="text-lg font-bold text-neutral-900">{item.name}</h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Photos */}
                        {step === 7 && (
                            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Add some photos of your house
                                </h1>
                                <p className="text-lg text-neutral-500">You'll need 5 photos to get started. You can add more or make changes later.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-64 border-2 border-dashed border-neutral-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-all"
                                    >
                                        <UploadCloud size={48} className="text-neutral-400 mb-4" />
                                        <span className="font-bold text-neutral-900">Upload Photos</span>
                                        <span className="text-sm text-neutral-500 mt-1">Drag and drop or click</span>
                                    </div>
                                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />

                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="h-64 rounded-3xl overflow-hidden relative group border border-neutral-200 shadow-sm">
                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 8: Title */}
                        {step === 8 && (
                            <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Now, let's give your house a title
                                </h1>
                                <p className="text-lg text-neutral-500">Short titles work best. Have fun with it—you can always change it later.</p>
                                
                                <textarea 
                                    rows={5}
                                    placeholder="e.g. Stunning Riad with Pool in Medina" 
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                    className="w-full p-6 text-2xl rounded-3xl border-2 border-neutral-300 bg-white font-bold text-neutral-900 focus:border-neutral-900 outline-none transition-all resize-none shadow-sm"
                                />
                            </motion.div>
                        )}

                        {/* STEP 9: Description */}
                        {step === 9 && (
                            <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Create your description
                                </h1>
                                <p className="text-lg text-neutral-500">Share what makes your place special.</p>
                                
                                <textarea 
                                    rows={8}
                                    placeholder="Describe your property..." 
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    className="w-full p-6 text-xl rounded-3xl border-2 border-neutral-300 bg-white font-medium text-neutral-900 focus:border-neutral-900 outline-none transition-all resize-none shadow-sm"
                                />
                            </motion.div>
                        )}

                        {/* STEP 10: Pricing */}
                        {step === 10 && (
                            <motion.div key="step10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8 text-center">
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Now, set your price
                                </h1>
                                <p className="text-lg text-neutral-500">You can change it anytime.</p>

                                <div className="flex items-center justify-center py-12">
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-6xl font-black text-neutral-300">MAD</span>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => updateForm('price', e.target.value)}
                                            className="w-full pl-[160px] pr-4 py-4 text-7xl font-black text-neutral-900 bg-transparent border-0 focus:ring-0 outline-none w-auto text-center placeholder-neutral-200"
                                            style={{ width: '400px' }}
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
