"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Home, MapPin, 
    Loader2, Sparkles, Map, Ticket, 
    Wifi, Tv, Car, Coffee, Wind, UploadCloud, X, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

const AMENITIES_LIST = [
    { id: 'wifi', name: 'Fast WiFi', icon: Wifi },
    { id: 'tv', name: 'Smart TV', icon: Tv },
    { id: 'parking', name: 'Free Parking', icon: Car },
    { id: 'kitchen', name: 'Kitchen', icon: Coffee },
    { id: 'ac', name: 'Air Conditioning', icon: Wind },
];

const MOCK_CITIES = ['Marrakech', 'Casablanca', 'Rabat', 'Fes', 'Tangier', 'Agadir', 'Essaouira', 'Chefchaouen'];

export default function HostOnboardingPage() {
    const router = useRouter();
    const { user, token, setAuth } = useAuthStore();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: '',
        location: '',
        amenities: [] as string[],
        photos: [] as string[],
        title: '',
        description: '',
        price: ''
    });

    // Location suggestions state
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, location: val });
        if (val.length > 0) {
            setSuggestions(MOCK_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectLocation = (city: string) => {
        setFormData({ ...formData, location: city });
        setShowSuggestions(false);
    };

    const toggleAmenity = (id: string) => {
        if (formData.amenities.includes(id)) {
            setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== id) });
        } else {
            setFormData({ ...formData, amenities: [...formData.amenities, id] });
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // For MVP, we will just create object URLs to preview them
            const newFiles = Array.from(e.target.files);
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newUrls]);
            // In a real app, you would upload these files via API and save the returned URLs to formData.photos
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
            // Submit the full listing to the backend
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                // Passing empty photos array since we didn't implement real file upload to S3 yet
                photos: [] 
            };

            const res = await api.post('/listings', payload);
            
            if (res.data && res.data.data) {
                // Update local auth store with new user role
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
        if (step === 2 && !formData.location) return true;
        if (step === 4 && previewUrls.length === 0) return true;
        if (step === 5 && (!formData.title || !formData.description)) return true;
        if (step === 6 && !formData.price) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            
            {/* Header */}
            <header className="h-20 border-b border-neutral-100 flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-50">
                <Link href="/host" className="text-2xl font-black text-amber-500 tracking-tight">Wijha</Link>
                <Link href="/host" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors">
                    Save & Exit
                </Link>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 h-1.5">
                <div 
                    className="bg-neutral-900 h-1.5 transition-all duration-500 ease-out" 
                    style={{ width: `${(step / 6) * 100}%` }}
                ></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: Property Type */}
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Which of these best describes your listing?
                                </h1>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'rental', icon: Home, label: 'Rental' },
                                        { id: 'tour', icon: Map, label: 'Tour' },
                                        { id: 'event', icon: Ticket, label: 'Event' },
                                    ].map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => setFormData({ ...formData, type: item.id })}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.type === item.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                        >
                                            <item.icon size={32} className={`mb-4 ${formData.type === item.id ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                            <h3 className="text-lg font-bold text-neutral-900">{item.label}</h3>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Location */}
                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 relative"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Where's your place located?
                                </h1>
                                <p className="text-lg text-neutral-500">Your exact address won't be shared with guests until they book.</p>
                                
                                <div className="relative">
                                    <MapPin size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Enter your city (e.g., Marrakech)" 
                                        value={formData.location}
                                        onChange={handleLocationChange}
                                        onFocus={() => { if (formData.location) setShowSuggestions(true) }}
                                        className="w-full pl-12 pr-6 py-5 text-lg rounded-2xl border-2 border-neutral-200 bg-white text-neutral-900 font-bold focus:border-neutral-900 focus:ring-0 outline-none transition-all shadow-sm"
                                        autoFocus
                                    />
                                    
                                    {/* Location Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50">
                                            {suggestions.map((city) => (
                                                <div 
                                                    key={city}
                                                    onClick={() => selectLocation(city)}
                                                    className="px-6 py-4 hover:bg-neutral-50 cursor-pointer flex items-center gap-3 border-b border-neutral-100 last:border-0"
                                                >
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <MapPin size={18} className="text-neutral-500" />
                                                    </div>
                                                    <span className="font-bold text-neutral-900">{city}, Morocco</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Amenities */}
                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Tell guests what your place has to offer
                                </h1>
                                <p className="text-lg text-neutral-500">You can add more amenities after you publish.</p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {AMENITIES_LIST.map((amenity) => {
                                        const isSelected = formData.amenities.includes(amenity.id);
                                        return (
                                            <div 
                                                key={amenity.id}
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-start ${isSelected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                            >
                                                <amenity.icon size={32} className={`mb-4 ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                                <h3 className="text-lg font-bold text-neutral-900">{amenity.name}</h3>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Photos */}
                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Add some photos of your place
                                </h1>
                                <p className="text-lg text-neutral-500">You'll need 1 photo to get started. You can add more or make changes later.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Upload Button */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-64 border-2 border-dashed border-neutral-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500 hover:bg-neutral-50 transition-all"
                                    >
                                        <UploadCloud size={48} className="text-neutral-400 mb-4" />
                                        <span className="font-bold text-neutral-900">Upload Photos</span>
                                        <span className="text-sm text-neutral-500 mt-1">Drag and drop or click</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        className="hidden" 
                                    />

                                    {/* Photo Previews */}
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

                        {/* STEP 5: Title & Description */}
                        {step === 5 && (
                            <motion.div 
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Give your listing a title and description
                                </h1>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Stunning Riad with Pool in Medina" 
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-4 text-lg rounded-2xl border-2 border-neutral-200 bg-white font-bold text-neutral-900 focus:border-neutral-900 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-900 mb-2">Description</label>
                                        <textarea 
                                            rows={5}
                                            placeholder="Tell guests what makes your place special..." 
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-4 text-lg rounded-2xl border-2 border-neutral-200 bg-white font-medium text-neutral-900 focus:border-neutral-900 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Pricing */}
                        {step === 6 && (
                            <motion.div 
                                key="step6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8 text-center"
                            >
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
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
            <footer className="h-24 border-t border-neutral-200 bg-white flex items-center justify-between px-4 sm:px-8 max-w-[1440px] mx-auto w-full sticky bottom-0 z-50">
                <div>
                    {step > 1 && (
                        <button 
                            onClick={prevStep}
                            className="px-6 py-3 rounded-full font-bold text-neutral-900 underline hover:bg-neutral-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                </div>
                <div>
                    {step < 6 ? (
                        <button 
                            onClick={nextStep}
                            disabled={isNextDisabled()}
                            className="px-8 py-3.5 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || isNextDisabled()}
                            className="px-8 py-3.5 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
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
