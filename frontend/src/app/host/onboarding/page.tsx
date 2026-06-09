"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, Building2, MapPin, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function HostOnboardingPage() {
    const router = useRouter();
    const { user, token, setAuth } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        propertyType: 'apartment',
        city: '',
    });

    // If not logged in, they can't become a host yet. They should be redirected to login.
    // However, we assume they are logged in if they clicked from Dashboard, or the middleware handles it.
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

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Call API to upgrade user role
            const res = await api.post('/host/apply', formData);
            
            // The API should return the updated user object
            if (res.data && res.data.data) {
                // Update local Zustand store so the UI immediately reflects the new role
                setAuth(res.data.data, token!);
                
                // Redirect to the new Host Dashboard!
                router.push('/dashboard?host=true');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            
            {/* Header */}
            <header className="h-20 border-b border-neutral-100 flex items-center justify-between px-4 sm:px-8">
                <Link href="/host" className="text-xl font-black text-amber-500">Wijha</Link>
                <Link href="/host" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors">
                    Exit
                </Link>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 h-1">
                <div 
                    className="bg-amber-500 h-1 transition-all duration-500 ease-out" 
                    style={{ width: `${(step / 3) * 100}%` }}
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
                                <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    What kind of place will you host?
                                </h1>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => setFormData({ ...formData, propertyType: 'apartment' })}
                                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.propertyType === 'apartment' ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <Building2 size={32} className={`mb-4 ${formData.propertyType === 'apartment' ? 'text-amber-500' : 'text-neutral-400'}`} />
                                        <h3 className="text-lg font-bold text-neutral-900">Apartment</h3>
                                    </div>
                                    <div 
                                        onClick={() => setFormData({ ...formData, propertyType: 'house' })}
                                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.propertyType === 'house' ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                                    >
                                        <Home size={32} className={`mb-4 ${formData.propertyType === 'house' ? 'text-amber-500' : 'text-neutral-400'}`} />
                                        <h3 className="text-lg font-bold text-neutral-900">House / Riad</h3>
                                    </div>
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
                                className="space-y-8"
                            >
                                <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    Where's your place located?
                                </h1>
                                <p className="text-lg text-neutral-500">Your exact address won't be shared with guests until they book.</p>
                                
                                <div className="relative">
                                    <MapPin size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Enter your city (e.g., Marrakech)" 
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full pl-12 pr-6 py-5 text-lg rounded-2xl border-2 border-neutral-200 bg-white font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all shadow-sm"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Confirmation */}
                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={40} className="text-amber-500" />
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                    You're ready to host!
                                </h1>
                                <p className="text-lg text-neutral-500 max-w-lg mx-auto">
                                    By clicking complete, your account will be upgraded to a Partner account. You will gain access to the Host Dashboard where you can publish your first listing.
                                </p>

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
            <footer className="h-24 border-t border-neutral-100 bg-white flex items-center justify-between px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
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
                    {step < 3 ? (
                        <button 
                            onClick={nextStep}
                            disabled={step === 2 && formData.city.trim().length === 0}
                            className="px-8 py-4 rounded-full bg-neutral-900 text-white font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-4 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Complete Setup'}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
