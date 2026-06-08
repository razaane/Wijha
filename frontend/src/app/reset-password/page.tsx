"use client";

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Lock, ArrowRight, Loader2, Compass } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';

    const [email] = useState(emailParam);
    const [token] = useState(tokenParam);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!token || !email) {
        return (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center">
                Invalid or missing password reset token. Please request a new link.
                <div className="mt-4">
                    <Link href="/forgot-password" className="text-amber-600 font-bold hover:underline">
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { 
                email, 
                token, 
                password, 
                password_confirmation: passwordConfirmation 
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to reset password. The token might be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center"
            >
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Password Reset Successfully</h3>
                <p className="text-green-600 mb-6">Your password has been updated. You will be redirected to the login page momentarily.</p>
                <Link href="/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Go to Login
                </Link>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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
                <label className="text-sm font-semibold text-neutral-700 ml-1">New Password</label>
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
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700 ml-1">Confirm New Password</label>
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
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                {!loading && <ArrowRight size={18} />}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex bg-white font-sans">
            
            {/* Left Side: The Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
                
                {/* Logo */}
                <Link href="/" className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2 group">
                    <Compass size={28} className="text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="text-2xl font-bold text-neutral-900 tracking-tight">Wijha</span>
                </Link>

                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">Set New Password</h1>
                        <p className="text-neutral-500 text-sm">Please choose a strong password for your account.</p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-amber-500" size={32} /></div>}>
                        <ResetPasswordForm />
                    </Suspense>

                </motion.div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="https://images.unsplash.com/photo-1542820229-081e0c12af0b?q=80&w=1600&auto=format&fit=crop" 
                    alt="Desert Dunes" 
                    className="absolute inset-0 w-full h-full object-cover rounded-l-[3rem] shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-l-[3rem]"></div>
                
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold mb-3 tracking-tight drop-shadow-md">Peace of Mind</h2>
                        <p className="text-lg text-white/90 drop-shadow-sm max-w-md">
                            Lost your way? We'll help you get back on track to your next great adventure.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
