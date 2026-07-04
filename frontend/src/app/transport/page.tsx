"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, BusFront, ArrowRight, TrainFront, MapPin, Calendar, Users, Search, Globe, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';
import Header from '@/components/landing/Header';
import { format, addMonths, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfDay, addDays, isAfter, startOfMonth } from 'date-fns';
import { api } from '@/lib/api';

interface Flight {
    id: string;
    airline: string;
    airline_code: string;
    provider?: string;
    logo: string;
    departure: { iataCode: string; time: string };
    arrival: { iataCode: string; time: string };
    duration: string;
    price: { amount: number; currency: string };
    stops: number;
    seats_available: number;
}


type TransportType = 'flights' | 'buses' | 'trains';

const FLIGHT_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Tunis', 'Algiers', 'Cairo', 'Dubai', 'Doha', 'Riyadh'].sort();

export default function TransportHub() {
    const router = useRouter();
    const [transportType, setTransportType] = useState<TransportType>('flights');
    
    // Form State
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
    const [passengers, setPassengers] = useState(1);
    
    // UI State
    const [activePopover, setActivePopover] = useState<'origin' | 'destination' | 'date' | 'guests' | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActivePopover(null);
        };
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Search Results State
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [provider, setProvider] = useState<'all' | 'amadeus' | 'skyscanner' | 'duffel'>('all');

    const handleSearch = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (transportType !== 'flights') {
            const params = new URLSearchParams();
            if (origin) params.set('origin', origin);
            if (destination) params.set('destination', destination);
            if (date) params.set('date', date.toISOString().split('T')[0]);
            if (passengers > 1) params.set('passengers', passengers.toString());
            router.push(`/transport/${transportType}?${params.toString()}`);
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);
        setActivePopover(null);
        
        try {
            const res = await api.post('/transport/flights/search', {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                date: date ? date.toISOString().split('T')[0] : undefined,
                passengers,
                provider
            });
            setFlights(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find flights. Make sure you use 3-letter IATA codes (e.g., CMN) or valid cities.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const renderCalendarMonth = (monthStart: Date) => {
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = date && isSameDay(day, date);
                const isPast = isBefore(day, startOfDay(new Date()));

                days.push(
                    <div 
                        key={day.toString()} 
                        className={`flex justify-center items-center w-10 h-10 text-sm font-semibold transition-all cursor-pointer relative
                            ${!isCurrentMonth ? 'text-transparent pointer-events-none' : ''}
                            ${isCurrentMonth && isPast ? 'text-neutral-300 dark:text-neutral-600 pointer-events-none line-through decoration-1' : ''}
                            ${isSelected ? 'bg-amber-500 text-white rounded-full z-10' : ''}
                            ${isCurrentMonth && !isPast && !isSelected ? 'text-neutral-900 dark:text-neutral-100 hover:border hover:border-neutral-900 dark:hover:border-white rounded-full' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth && !isPast) {
                                setDate(cloneDay);
                                setActivePopover('guests');
                            }
                        }}
                    >
                        <span className={!isCurrentMonth ? 'hidden' : ''}>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="flex justify-between w-full mb-1" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="flex flex-col w-[320px]">
                <div className="text-center font-bold mb-6 text-neutral-900 dark:text-white">
                    {format(monthStart, "MMMM yyyy")}
                </div>
                <div className="flex justify-between w-full mb-4 px-2">
                    {weekDays.map(d => (
                        <div key={d} className="w-10 text-center text-xs font-semibold text-neutral-400">{d}</div>
                    ))}
                </div>
                {rows}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans flex flex-col">
            <Header hideSearch />
            
            {/* Background overlay when popover is open */}
            {activePopover && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-30 transition-opacity"></div>
            )}
            
            {/* Main Content */}
            <main className="flex-1 w-full px-4 sm:px-8 xl:px-16 pt-12 pb-24 flex flex-col items-center relative z-40">
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-neutral-900 dark:text-white">
                        Find your next destination
                    </h1>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
                        Search flights, buses, and trains across the MENA region.
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1.5 shadow-inner border border-neutral-200 dark:border-neutral-800 mb-6"
                >
                    <button 
                        onClick={() => setTransportType('flights')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${transportType === 'flights' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Plane size={18} /> Flights
                    </button>
                    <button 
                        onClick={() => setTransportType('buses')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${transportType === 'buses' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <BusFront size={18} /> Buses
                    </button>
                    <button 
                        onClick={() => setTransportType('trains')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${transportType === 'trains' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <TrainFront size={18} /> Trains
                    </button>
                </motion.div>

                {/* Search Bar - Wijha Style Pill */}
                <motion.div 
                    ref={searchRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-4xl relative"
                >
                    <div className={`border border-neutral-200 dark:border-neutral-800 rounded-full flex flex-col lg:flex-row items-stretch w-full transition-all relative
                        ${activePopover ? 'bg-neutral-200 dark:bg-neutral-900 shadow-none' : 'bg-neutral-100 dark:bg-neutral-800 shadow-md'}`}
                        style={{ height: '66px' }}
                    >
                        {/* Origin */}
                        <div 
                            onClick={() => setActivePopover('origin')}
                            className={`flex flex-col justify-center text-left px-8 w-full lg:w-[28%] rounded-full transition-all cursor-pointer relative z-10
                            ${activePopover === 'origin' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                        >
                            <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">From</span>
                            <input 
                                type="text" 
                                value={origin}
                                onChange={(e) => {
                                    setOrigin(e.target.value);
                                    if (activePopover !== 'origin') setActivePopover('origin');
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Origin city" 
                                className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 font-medium text-sm w-full truncate cursor-text" 
                            />
                        </div>

                        {/* Divider */}
                        <div className={`hidden lg:flex items-center shrink-0 transition-opacity ${activePopover === 'origin' || activePopover === 'destination' ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                        </div>

                        {/* Destination */}
                        <div 
                            onClick={() => setActivePopover('destination')}
                            className={`flex flex-col justify-center text-left px-8 w-full lg:w-[28%] rounded-full transition-all cursor-pointer relative z-10
                            ${activePopover === 'destination' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                        >
                            <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">To</span>
                            <input 
                                type="text" 
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value);
                                    if (activePopover !== 'destination') setActivePopover('destination');
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Destination city" 
                                className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 font-medium text-sm w-full truncate cursor-text" 
                            />
                        </div>

                        {/* Divider */}
                        <div className={`hidden lg:flex items-center shrink-0 transition-opacity ${activePopover === 'destination' || activePopover === 'date' ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                        </div>

                        {/* Date */}
                        <div 
                            onClick={() => setActivePopover('date')}
                            className={`flex flex-col justify-center text-left px-8 w-full lg:w-[22%] rounded-full transition-all cursor-pointer relative z-10
                            ${activePopover === 'date' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                        >
                            <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase whitespace-nowrap">Date</span>
                            <span className={`font-medium text-sm w-full truncate ${date ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                                {date ? format(date, 'MMM d, yyyy') : 'Add dates'}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className={`hidden lg:flex items-center shrink-0 transition-opacity ${activePopover === 'date' || activePopover === 'guests' ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                        </div>

                        {/* Travelers & Search Button */}
                        <div 
                            onClick={() => setActivePopover('guests')}
                            className={`flex items-center pl-8 w-full lg:flex-1 justify-between rounded-full transition-all cursor-pointer relative z-10
                            ${activePopover === 'guests' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                        >
                            <div className="flex flex-col justify-center text-left">
                                <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">Travelers</span>
                                <span className={`font-medium text-sm truncate ${passengers > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                                    {passengers} Traveler{passengers > 1 ? 's' : ''}
                                </span>
                            </div>
                            <button 
                                onClick={handleSearch} 
                                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg shadow-amber-500/30 gap-2 font-black tracking-wide mx-2"
                                style={{ height: '48px', width: '48px', minWidth: 'auto' }}
                            >
                                <Search size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Popovers */}
                    <AnimatePresence>
                        {/* Origin Popover */}
                        {activePopover === 'origin' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[120%] left-0 w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-[9999]"
                            >
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 pl-2">Popular Cities</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {FLIGHT_CITIES.map((city) => (
                                        <button 
                                            key={city} 
                                            onClick={() => { setOrigin(city); setActivePopover('destination'); }}
                                            className={`text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors text-neutral-700 dark:text-neutral-300 ${!city.toLowerCase().includes(origin.toLowerCase()) ? 'hidden' : ''}`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Destination Popover */}
                        {activePopover === 'destination' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[120%] left-[28%] w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-[9999]"
                            >
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 pl-2">Popular Cities</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {FLIGHT_CITIES.map((city) => (
                                        <button 
                                            key={city} 
                                            onClick={() => { setDestination(city); setActivePopover('date'); }}
                                            className={`text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors text-neutral-700 dark:text-neutral-300 ${!city.toLowerCase().includes(destination.toLowerCase()) ? 'hidden' : ''}`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Date Popover */}
                        {activePopover === 'date' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 z-[9999]"
                            >
                                <div className="flex flex-col items-center relative px-2">
                                    <div className="w-full flex justify-between absolute top-0 px-0">
                                        <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    
                                    {renderCalendarMonth(currentMonth)}
                                </div>
                                <div className="mt-4 flex justify-start border-t border-neutral-100 dark:border-neutral-800 pt-4">
                                    <button 
                                        onClick={() => setDate(null)}
                                        className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 transition-colors"
                                    >
                                        Clear date
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Travelers Popover */}
                        {activePopover === 'guests' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[120%] right-0 w-full max-w-xs bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-[9999]"
                            >
                                <div className="flex items-center justify-between pb-4">
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-white">Passengers</p>
                                        <p className="text-sm text-neutral-500">Ages 2 or above</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setPassengers(Math.max(1, passengers - 1))}
                                            disabled={passengers <= 1}
                                            className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:border-neutral-900 dark:hover:border-white disabled:opacity-50 transition-colors"
                                        >-</button>
                                        <span className="w-4 text-center font-bold text-neutral-900 dark:text-white">{passengers}</span>
                                        <button 
                                            onClick={() => setPassengers(Math.min(9, passengers + 1))}
                                            className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:border-neutral-900 dark:hover:border-white transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Search Results Area */}
                <div className="w-full max-w-6xl mt-16 relative">
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium mb-8 text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Empty State / Default Info Cards */}
                        {!searched && !loading && (
                            <motion.div 
                                key="default-cards"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="grid md:grid-cols-3 gap-6 w-full"
                            >
                                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <Plane size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">Seamless Flights</h3>
                                    <p className="text-neutral-500 font-medium">Find the fastest routes and best deals across major airlines in the region. Real-time availability for hassle-free bookings.</p>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <TrainFront size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">High-Speed Rail</h3>
                                    <p className="text-neutral-500 font-medium">Experience the Al Boraq TGV and scenic intercity routes. Book premium seats effortlessly through our integrated platform.</p>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <BusFront size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">Premium Coaches</h3>
                                    <p className="text-neutral-500 font-medium">Travel comfortably with top-tier coach operators. Air conditioning, Wi-Fi, and spacious seating for your journey.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
                                <p className="text-neutral-500 font-medium">Searching for the best routes...</p>
                            </motion.div>
                        )}

                        {/* No Results */}
                        {searched && !loading && flights.length === 0 && !error && (
                            <motion.div 
                                key="no-results"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800"
                            >
                                <Plane size={64} className="mx-auto text-neutral-300 mb-4" />
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No flights found</h3>
                                <p className="text-neutral-500">Try adjusting your dates or destinations.</p>
                            </motion.div>
                        )}

                        {/* Results List */}
                        {searched && !loading && flights.length > 0 && (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {flights.length} flights found
                                    </h2>
                                    
                                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl overflow-x-auto hide-scrollbar">
                                        {(['all', 'amadeus', 'skyscanner', 'duffel'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={(e) => {
                                                    setProvider(p);
                                                    setTimeout(() => handleSearch(e), 50);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${provider === p ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                                            >
                                                {p === 'all' ? 'All Providers' : p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {flights.map((flight, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={flight.id}
                                        className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group flex flex-col lg:flex-row gap-6 items-center"
                                    >
                                        {/* Airline Info */}
                                        <div className="w-full lg:w-48 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 p-2 flex-shrink-0 flex items-center justify-center">
                                                    <img src={flight.logo} alt={flight.airline} className="max-w-full max-h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900 dark:text-white">{flight.airline}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-neutral-500">{flight.id.split('-')[1]}-{flight.id.split('-')[2]}</p>
                                                        {flight.provider && (
                                                            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                                {flight.provider}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
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
                                            <Link 
                                                href={`/transport/checkout/${flight.id}`}
                                                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-center"
                                            >
                                                Select
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </main>
        </div>
    );
}
