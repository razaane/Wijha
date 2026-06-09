"use client";

import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Hotel, Plane, Map, Ticket, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
    const { user } = useAuthStore();

    if (!user) return null;

    const categories = [
        { name: 'Stays', icon: Hotel, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Flights', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-50' },
        { name: 'Tours', icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { name: 'Events', icon: Ticket, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const popularDestinations = [
        { name: 'Marrakech', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=600&auto=format&fit=crop', properties: 124 },
        { name: 'Chefchaouen', image: 'https://images.unsplash.com/photo-1552688468-154a4ebda294?q=80&w=600&auto=format&fit=crop', properties: 86 },
        { name: 'Agadir', image: 'https://images.unsplash.com/photo-1574005886326-11f8e136b13e?q=80&w=600&auto=format&fit=crop', properties: 210 },
        { name: 'Essaouira', image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=600&auto=format&fit=crop', properties: 145 },
    ];

    return (
        <div className="min-h-screen bg-white pb-20">
            
            {/* HERO BANNER SECTION (Eventbrite Style) */}
            <div className="relative pt-8 px-4 sm:px-8 max-w-[1440px] mx-auto">
                <div className="relative h-[400px] md:h-[480px] rounded-[32px] overflow-hidden flex items-center justify-center">
                    {/* Background Image & Overlay */}
                    <img 
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop" 
                        alt="Hero Background" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    {/* Hero Content */}
                    <div className="relative z-10 text-center px-4 w-full max-w-4xl">
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm tracking-widest uppercase mb-4"
                        >
                            Find your next adventure
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight drop-shadow-lg"
                        >
                            Where do you want <br className="hidden md:block"/> to go, <span className="text-amber-400">{user.name.split(' ')[0]}?</span>
                        </motion.h1>

                        {/* SEARCH PILL (Airbnb Style) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center max-w-3xl mx-auto w-full border border-white/20 backdrop-blur-sm"
                        >
                            <div className="flex-1 flex items-center px-6 py-3 w-full md:border-r border-neutral-200">
                                <MapPin size={24} className="text-neutral-400 mr-3" />
                                <div className="text-left w-full">
                                    <p className="text-xs font-bold text-neutral-900">Where</p>
                                    <input type="text" placeholder="Search destinations" className="w-full bg-transparent outline-none text-sm text-neutral-600 placeholder-neutral-400" />
                                </div>
                            </div>
                            <div className="flex-1 flex items-center px-6 py-3 w-full md:border-r border-neutral-200">
                                <Calendar size={24} className="text-neutral-400 mr-3" />
                                <div className="text-left w-full">
                                    <p className="text-xs font-bold text-neutral-900">When</p>
                                    <input type="text" placeholder="Add dates" className="w-full bg-transparent outline-none text-sm text-neutral-600 placeholder-neutral-400" />
                                </div>
                            </div>
                            <div className="flex-1 flex items-center pl-6 pr-2 py-3 w-full justify-between">
                                <div className="flex items-center">
                                    <Users size={24} className="text-neutral-400 mr-3" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-neutral-900">Who</p>
                                        <input type="text" placeholder="Add guests" className="w-full bg-transparent outline-none text-sm text-neutral-600 placeholder-neutral-400" />
                                    </div>
                                </div>
                                <button className="bg-amber-500 hover:bg-amber-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 shadow-lg">
                                    <Search size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CATEGORIES SECTION */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, idx) => (
                        <motion.div 
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="bg-white border border-neutral-100 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-transparent transition-all group"
                        >
                            <div className={`w-16 h-16 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon size={28} />
                            </div>
                            <span className="font-bold text-neutral-900">{cat.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* WHY WIJHA (Booking.com feature cards style) */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-16">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Why book with Wijha?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-neutral-50 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Secure Payments</h3>
                        <p className="text-neutral-500">Book with confidence using our 100% secure payment gateway and flexible cancellation policies.</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-neutral-50 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                            <Map size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Local Experiences</h3>
                        <p className="text-neutral-500">Discover hidden gems and authentic experiences curated by verified local guides.</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-neutral-50 rounded-3xl p-8"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                            <Hotel size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Premium Stays</h3>
                        <p className="text-neutral-500">Choose from over 10,000 handpicked villas, riads, and luxury apartments.</p>
                    </motion.div>
                </div>
            </div>

            {/* POPULAR DESTINATIONS (Airbnb card grid style) */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mt-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900">Popular Destinations</h2>
                    <Link href="/explore" className="text-amber-500 font-bold flex items-center hover:text-amber-600 transition-colors">
                        Explore All <ChevronRight size={20} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {popularDestinations.map((dest, idx) => (
                        <motion.div 
                            key={dest.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + (idx * 0.1) }}
                            className="group cursor-pointer"
                        >
                            <div className="relative w-full aspect-square rounded-[32px] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                                <img 
                                    src={dest.image} 
                                    alt={dest.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">{dest.name}</h3>
                            <p className="text-neutral-500 text-sm">{dest.properties} properties</p>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
}
