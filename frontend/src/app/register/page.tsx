"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, Compass, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1 State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // Step 2 State
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register/send-otp', { 
                name, 
                email, 
                password, 
                password_confirmation: passwordConfirmation 
            });
            setStep(2);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to send verification code. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/register', { 
                name, 
                email, 
                password, 
                password_confirmation: passwordConfirmation,
                otp
            });
            const { user, access_token } = res.data.data;
            setAuth(user, access_token);
            router.push('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string, errors?: { otp?: string[] } } } };
            setError(error.response?.data?.errors?.otp?.[0] || error.response?.data?.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            
            {/* Left Side: The Inspiration */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?q=80&w=1600&auto=format&fit=crop" 
                    alt="Sahara Desert" 
                    className="absolute inset-0 w-full h-full object-cover rounded-r-[3rem] shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-r-[3rem]"></div>
                
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold mb-3 tracking-tight drop-shadow-md">Journey into the Sahara</h2>
                        <p className="text-lg text-white/90 drop-shadow-sm max-w-md">
                            Experience the vastness of the golden dunes under an infinite canopy of stars. Join us today.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: The Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12">
                
                {/* Logo */}
                <div className="absolute top-8 right-8 sm:right-16 md:right-24 xl:right-32 flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl font-bold text-neutral-900 tracking-tight">Wijha</span>
                        <Compass size={28} className="text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
                    </Link>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="mb-8 mt-8 lg:mt-0">
                                    <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">Create Account</h1>
                                    <p className="text-neutral-500 text-sm">Join the leading travel platform in the MENA region.</p>
                                </div>

                                {/* Social Logins */}
                                <div className="flex flex-col gap-3 mb-8">
                                    <button type="button" onClick={() => window.location.href = 'http://localhost:8000/api/v1/auth/google/redirect'} className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-neutral-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-neutral-500">Or continue with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-medium"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-medium"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-neutral-700 ml-1">Password</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-medium"
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={8}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-neutral-700 ml-1">Confirm</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-medium"
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={8}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Continue'}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="text-center text-neutral-500 text-sm mt-8 font-medium">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-amber-500 hover:text-amber-600 font-bold transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <button 
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-amber-500 transition-colors mb-6"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                
                                <div className="mb-8 mt-4 lg:mt-0">
                                    <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">Verify Email</h1>
                                    <p className="text-neutral-500 text-sm">
                                        We sent a 6-digit verification code to <br/>
                                        <span className="font-bold text-neutral-800">{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-6">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-neutral-700 ml-1">Verification Code</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-bold text-center tracking-[0.5em] text-2xl"
                                            placeholder="••••••"
                                            required
                                            maxLength={6}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Create Account'}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </form>
                                
                                <p className="text-center text-neutral-500 text-sm mt-8 font-medium">
                                    Didn't receive the code?{' '}
                                    <button 
                                        type="button" 
                                        onClick={handleSendOtp}
                                        className="text-amber-500 hover:text-amber-600 font-bold transition-colors"
                                    >
                                        Resend
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
