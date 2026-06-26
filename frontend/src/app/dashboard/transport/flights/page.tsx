"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Plane, Search, Calendar, Users, MapPin, Loader2, ArrowRightLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface Flight {
    id: string;
    airline: string;
    airline_code: string;
    logo: string;
    departure: { iataCode: string; time: string };
    arrival: { iataCode: string; time: string };
    duration: string;
    price: { amount: number; currency: string };
    stops: number;
    seats_available: number;
}

export default function FlightsSearch() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);
        
        try {
            const res = await api.post('/transport/flights/search', {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                date,
                passengers
            });
            setFlights(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find flights. Make sure you use 3-letter IATA codes (e.g., CMN).');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/transport" className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <ArrowRightLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Search Flights</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Find the best deals across the MENA region</p>
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
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Origin (e.g. CMN)"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                maxLength={3}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 uppercase placeholder:normal-case transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">To</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Dest (e.g. ORY)"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                maxLength={3}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 uppercase placeholder:normal-case transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Travelers</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <input 
                                type="number"
                                min={1}
                                max={9}
                                value={passengers}
                                onChange={(e) => setPassengers(parseInt(e.target.value))}
                                required
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex items-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 h-[56px]"
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
                {searched && !loading && flights.length === 0 && !error && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-20"
                    >
                        <Plane size={64} className="mx-auto text-neutral-300 mb-4" />
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No flights found</h3>
                        <p className="text-neutral-500">Try adjusting your dates or destinations.</p>
                    </motion.div>
                )}

                {flights.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                            {flights.length} flights found
                        </h2>
                        
                        {flights.map((flight, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={flight.id}
                                className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group flex flex-col lg:flex-row gap-6 items-center"
                            >
                                {/* Airline Info */}
                                <div className="w-full lg:w-48 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 p-2 flex-shrink-0 flex items-center justify-center">
                                        <img src={flight.logo} alt={flight.airline} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-white">{flight.airline}</p>
                                        <p className="text-xs text-neutral-500">{flight.id}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex-1 w-full flex items-center justify-between px-4 lg:px-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-neutral-900 dark:text-white">{formatTime(flight.departure.time)}</p>
                                        <p className="text-sm font-semibold text-neutral-500">{flight.departure.iataCode}</p>
                                    </div>

                                    <div className="flex-1 px-4 flex flex-col items-center">
                                        <p className="text-xs font-bold text-neutral-400 mb-1 flex items-center gap-1">
                                            <Clock size={12} /> {flight.duration}
                                        </p>
                                        <div className="w-full flex items-center">
                                            <div className="h-px bg-neutral-200 dark:bg-neutral-700 flex-1"></div>
                                            <div className="px-2 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 rounded-full py-0.5">
                                                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                                            </div>
                                            <div className="h-px bg-neutral-200 dark:bg-neutral-700 flex-1"></div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-black text-neutral-900 dark:text-white">{formatTime(flight.arrival.time)}</p>
                                        <p className="text-sm font-semibold text-neutral-500">{flight.arrival.iataCode}</p>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="w-full lg:w-48 flex flex-col lg:items-end justify-center pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 pl-0 lg:pl-6 gap-2">
                                    <div className="flex items-end gap-1">
                                        <span className="text-lg font-bold text-neutral-500">{flight.price.currency}</span>
                                        <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{flight.price.amount}</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-semibold mb-2">Only {flight.seats_available} seats left</p>
                                    <button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors">
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
