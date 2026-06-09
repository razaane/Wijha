"use client";

import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import { Compass, Calendar, MapPin, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardOverview() {
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !user) return null;

    const stats = [
        { label: 'Upcoming Trips', value: '0', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Saved Destinations', value: '0', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Places Visited', value: '0', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">
                    Welcome back, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-neutral-500 text-lg">Here's an overview of your Wijha journey.</p>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-5"
                        >
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-neutral-500 font-medium mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-neutral-900">{stat.value}</h3>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State for Bookings */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-10 text-center border border-neutral-100 shadow-sm"
            >
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                    <Compass size={40} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Your next adventure awaits</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-8">
                    You haven't booked any trips yet. Discover amazing destinations across the MENA region and start planning!
                </p>
                <button className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-[0.98]">
                    Explore Destinations
                </button>
            </motion.div>
        </div>
    );
}
