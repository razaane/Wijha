"use client";

import { useState, useEffect } from 'react';
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

const FLIGHT_CITIES = [
    { name: 'Casablanca (CMN)', iata: 'CMN' },
    { name: 'Rabat (RBA)', iata: 'RBA' },
    { name: 'Marrakech (RAK)', iata: 'RAK' },
    { name: 'Tangier (TNG)', iata: 'TNG' },
    { name: 'Agadir (AGA)', iata: 'AGA' },
    { name: 'Fes (FEZ)', iata: 'FEZ' },
    { name: 'Tunis (TUN)', iata: 'TUN' },
    { name: 'Algiers (ALG)', iata: 'ALG' },
    { name: 'Cairo (CAI)', iata: 'CAI' },
    { name: 'Dubai (DXB)', iata: 'DXB' },
    { name: 'Doha (DOH)', iata: 'DOH' },
    { name: 'Riyadh (RUH)', iata: 'RUH' },
    { name: 'Jeddah (JED)', iata: 'JED' },
    { name: 'Amman (AMM)', iata: 'AMM' },
    { name: 'Beirut (BEY)', iata: 'BEY' },
    { name: 'Muscat (MCT)', iata: 'MCT' },
    { name: 'Kuwait (KWI)', iata: 'KWI' },
    { name: 'Manama (BAH)', iata: 'BAH' },
    { name: 'Paris (CDG)', iata: 'CDG' },
    { name: 'London (LHR)', iata: 'LHR' },
    { name: 'Istanbul (IST)', iata: 'IST' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function FlightsSearch() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const defaultIata = 'CMN'; // Casablanca
        setOrigin(defaultIata);
        setLoading(true);
        api.get(`/transport/flights/discover?origin=${defaultIata}`)
            .then(res => {
                setFlights(res.data.data);
                setSearched(true);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (origin === destination) {
            setError("Origin and Destination cannot be the same.");
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);
        
        try {
            const res = await api.post('/transport/flights/search', {
                origin,
                destination,
                date,
                passengers
            });
            setFlights(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find flights. Amadeus API may require valid routes.');
            setFlights([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 relative">
            {/* Background Gradients for Premium Feel */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/transport" className="w-10 h-10 bg-white/50 backdrop-blur-md dark:bg-neutral-800/50 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 transition-all border border-neutral-200/50 dark:border-neutral-700 shadow-sm">
                    <ArrowRightLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400">Search Flights</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mt-1">Discover premium routes across the globe</p>
                </div>
            </div>

            {/* Search Box */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl dark:bg-neutral-900/80 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-neutral-200/50 dark:shadow-none border border-white/50 dark:border-neutral-800 mb-12"
            >
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">From</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <select 
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                required
                                className="w-full bg-neutral-100/50 dark:bg-neutral-800/50 border-none rounded-2xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Origin</option>
                                {FLIGHT_CITIES.map(c => <option key={c.iata} value={c.iata}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">To</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            <select 
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                                className="w-full bg-neutral-100/50 dark:bg-neutral-800/50 border-none rounded-2xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Destination</option>
                                {FLIGHT_CITIES.map(c => <option key={c.iata} value={c.iata}>{c.name}</option>)}
                            </select>
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
                                className="w-full bg-neutral-100/50 dark:bg-neutral-800/50 border-none rounded-2xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all"
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
                                className="w-full bg-neutral-100/50 dark:bg-neutral-800/50 border-none rounded-2xl pl-12 pr-4 py-4 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 transition-all"
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
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl font-medium mb-8 text-center border border-red-100 dark:border-red-500/20">
                    {error}
                </motion.div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {searched && !loading && flights.length === 0 && !error && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-24 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800"
                    >
                        <Plane size={64} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-6" />
                        <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">No flights found</h3>
                        <p className="text-neutral-500">Try adjusting your dates or destinations.</p>
                    </motion.div>
                )}

                {flights.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 px-3 py-1 rounded-lg text-lg">{flights.length}</span> 
                            Flights available
                        </h2>
                        
                        {flights.map((flight, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={flight.id}
                                className="bg-white/80 backdrop-blur-md dark:bg-neutral-900/80 border border-white dark:border-neutral-800 p-6 sm:p-8 rounded-[2rem] hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group flex flex-col lg:flex-row gap-6 items-center"
                            >
                                {/* Airline Info */}
                                <div className="w-full lg:w-56 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-neutral-100 p-2.5 flex-shrink-0 flex items-center justify-center">
                                        <img src={flight.logo} alt={flight.airline} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">{flight.airline}</p>
                                        <p className="text-xs font-semibold text-neutral-400 mt-1">{flight.id}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex-1 w-full flex items-center justify-between px-2 sm:px-8">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-neutral-900 dark:text-white">{formatTime(flight.departure.time)}</p>
                                        <p className="text-sm font-bold text-neutral-500 mt-1">{flight.departure.iataCode}</p>
                                    </div>

                                    <div className="flex-1 px-4 sm:px-8 flex flex-col items-center">
                                        <p className="text-xs font-bold text-neutral-400 mb-2 flex items-center gap-1">
                                            <Clock size={12} /> {flight.duration}
                                        </p>
                                        <div className="w-full flex items-center">
                                            <div className="h-[2px] bg-neutral-200 dark:bg-neutral-700 flex-1 rounded-full"></div>
                                            <div className="px-3 text-[10px] uppercase tracking-wider font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 rounded-full py-1 border border-amber-100 dark:border-amber-500/20">
                                                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                                            </div>
                                            <div className="h-[2px] bg-neutral-200 dark:bg-neutral-700 flex-1 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-3xl font-black text-neutral-900 dark:text-white">{formatTime(flight.arrival.time)}</p>
                                        <p className="text-sm font-bold text-neutral-500 mt-1">{flight.arrival.iataCode}</p>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="w-full lg:w-56 flex flex-col lg:items-end justify-center pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 pl-0 lg:pl-8 gap-2">
                                    <div className="flex items-start gap-1">
                                        <span className="text-sm font-bold text-neutral-500 mt-1.5">{flight.price.currency}</span>
                                        <span className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">{flight.price.amount}</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-bold mb-3 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">Only {flight.seats_available} seats left</p>
                                    <button 
                                        onClick={() => {
                                            const flightOrigin = flight.departure.iataCode.toLowerCase();
                                            const flightDest = flight.arrival.iataCode.toLowerCase();
                                            
                                            const departureDateObj = new Date(flight.departure.time);
                                            const yy = departureDateObj.getFullYear().toString().slice(2);
                                            const mm = (departureDateObj.getMonth() + 1).toString().padStart(2, '0');
                                            const dd = departureDateObj.getDate().toString().padStart(2, '0');
                                            const formattedDate = `${yy}${mm}${dd}`;
                                            
                                            const url = `https://www.skyscanner.com/transport/flights/${flightOrigin}/${flightDest}/${formattedDate}?adults=${passengers}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                    >
                                        Select Flight
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
