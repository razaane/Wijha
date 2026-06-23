"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Mail, ArrowRight, Loader2, Compass, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-amber-500 transition-colors mb-6">
                            <ArrowLeft size={16} /> Back to login
                        </Link>
                        <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">Forgot Password</h1>
                        <p className="text-neutral-500 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                    </div>

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

                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-lg text-sm text-center"
                            >
                                A password reset link has been sent to your email address. Please check your inbox.
                            </motion.div>
                        )}

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

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
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
