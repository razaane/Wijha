"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { BusFront, Search, Calendar, Users, MapPin, Loader2, ArrowRightLeft, Clock, Wifi, Plug, Airplay } from 'lucide-react';
import Link from 'next/link';

interface Bus {
    id: string;
    operator: string;
    logo: string;
    departure: { station: string; time: string };
    arrival: { station: string; time: string };
    duration: string;
    price: { amount: number; currency: string };
    amenities: string[];
    seats_available: number;
}

export default function BusesSearch() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);
        
        try {
            const res = await api.post('/transport/buses/search', {
                origin,
                destination,
                date,
                passengers
            });
            setBuses(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find buses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity.toLowerCase()) {
            case 'wifi': return <Wifi size={14} />;
            case 'power outlets': return <Plug size={14} />;
            case 'air conditioning': return <Airplay size={14} />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/transport" className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <ArrowRightLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Intercity Buses</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Comfortable trips across the Maghreb</p>
                </div>
            </div>

            {/* Search Box */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-neutral-200/50 dark:shadow-none border border-neutral-100 dark:border-neutral-800 mb-12"
            >
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">From</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="City (e.g. Marrakech)"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all capitalize"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">To</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="City (e.g. Agadir)"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all capitalize"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Passengers</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="number"
                                min={1}
                                max={9}
                                value={passengers}
                                onChange={(e) => setPassengers(parseInt(e.target.value))}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex items-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 h-[56px]"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Search size={20} /> Search</>}
                        </button>
                    </div>

                </form>
            </motion.div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium mb-8 text-center border border-red-100">
                    {error}
                </div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {searched && !loading && buses.length === 0 && !error && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-20"
                    >
                        <BusFront size={64} className="mx-auto text-neutral-300 mb-4" />
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No buses found</h3>
                        <p className="text-neutral-500">Try adjusting your dates or destinations.</p>
                    </motion.div>
                )}

                {buses.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                            {buses.length} buses found
                        </h2>
                        
                        {buses.map((bus, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={bus.id}
                                className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group flex flex-col lg:flex-row gap-6 items-center"
                            >
                                {/* Operator Info */}
                                <div className="w-full lg:w-48 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 p-2 flex-shrink-0 flex items-center justify-center">
                                        <img src={bus.logo} alt={bus.operator} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-white">{bus.operator}</p>
                                        <p className="text-xs text-neutral-500">{bus.id}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex-1 w-full flex items-center justify-between px-4 lg:px-8">
                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-black text-neutral-900 dark:text-white">{formatTime(bus.departure.time)}</p>
                                        <p className="text-xs font-semibold text-neutral-500 truncate max-w-[120px] mx-auto">{bus.departure.station}</p>
                                    </div>

                                    <div className="flex-1 px-4 flex flex-col items-center">
                                        <p className="text-xs font-bold text-neutral-400 mb-1 flex items-center gap-1">
                                            <Clock size={12} /> {bus.duration}
                                        </p>
                                        <div className="w-full flex items-center">
                                            <div className="h-px bg-neutral-200 dark:bg-neutral-700 flex-1"></div>
                                            <div className="px-2 text-neutral-300 dark:text-neutral-600">
                                                <ArrowRightLeft size={16} />
                                            </div>
                                            <div className="h-px bg-neutral-200 dark:bg-neutral-700 flex-1"></div>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-2">
                                            {bus.amenities.map(amenity => (
                                                <div key={amenity} title={amenity} className="text-neutral-400">
                                                    {getAmenityIcon(amenity)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-black text-neutral-900 dark:text-white">{formatTime(bus.arrival.time)}</p>
                                        <p className="text-xs font-semibold text-neutral-500 truncate max-w-[120px] mx-auto">{bus.arrival.station}</p>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="w-full lg:w-48 flex flex-col lg:items-end justify-center pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 pl-0 lg:pl-6 gap-2">
                                    <div className="flex items-end gap-1">
                                        <span className="text-lg font-bold text-neutral-500">{bus.price.currency}</span>
                                        <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{bus.price.amount}</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-semibold mb-2">Only {bus.seats_available} seats left</p>
                                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                                        Select
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
