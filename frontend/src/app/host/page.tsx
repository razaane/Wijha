"use client";

import { motion } from 'framer-motion';
import { Home, Shield, Map, Banknote, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HostLandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-amber-500 tracking-tight">Wijha</Link>
                    <Link href="/host/onboarding" className="px-6 py-2.5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-8 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 text-center lg:text-left">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-tight mb-6"
                    >
                        Open your door <br className="hidden lg:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">to the world.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-neutral-500 mb-10 max-w-2xl mx-auto lg:mx-0"
                    >
                        Turn your extra space, riad, or local expertise into extra income. Join thousands of hosts on Wijha.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                    >
                        <Link href="/host/onboarding" className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                            Become a Host <ChevronRight size={20} />
                        </Link>
                    </motion.div>
                </div>

                {/* Earnings Estimator Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 w-full max-w-md bg-white border border-neutral-200 rounded-[32px] p-8 shadow-2xl relative"
                >
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-100 rounded-full blur-3xl z-0"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Estimate your earnings</h3>
                        <p className="text-neutral-500 mb-8">See how much you could make sharing your space.</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-900 mb-2">Where is your place?</label>
                                <input type="text" defaultValue="Marrakech, Morocco" className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-900 mb-2">What kind of space?</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none">
                                    <option>Entire Place (2 guests)</option>
                                    <option>Private Room</option>
                                    <option>Shared Room</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Potential Income</span>
                            <div className="text-5xl font-black text-amber-500 my-2">MAD 8,450</div>
                            <span className="text-sm text-neutral-400">per month (estimated)</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Benefits Section */}
            <section className="bg-neutral-50 py-24">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                    <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 text-center mb-16">Why host on Wijha?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Banknote size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">Keep what you earn</h3>
                            <p className="text-neutral-500">We offer some of the lowest host fees in the industry. More money stays in your pocket.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">Comprehensive Protection</h3>
                            <p className="text-neutral-500">Every booking includes damage protection and liability insurance at no extra cost to you.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                                <Home size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">Total Control</h3>
                            <p className="text-neutral-500">You decide when to host, your prices, and your house rules. You're the boss.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
