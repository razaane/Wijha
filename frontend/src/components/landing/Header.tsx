'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Search, MapPin, Calendar, Users, Home, Map as MapIcon, Briefcase } from 'lucide-react';

export default function Header() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [activeTab, setActiveTab] = useState('stays');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set('type', activeTab === 'experiences' ? 'event' : 'rental');
        if (location) params.set('location', location);
        if (date) params.set('date', date);
        if (guests > 1) params.set('guests', guests.toString());
        
        router.push(`/browse?${params.toString()}`);
    };

    return (
        <nav className="w-full bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center pt-4 pb-8 px-4 md:px-8 xl:px-16">
            
            {/* Top Row: Logo, Pill Categories, User Actions */}
            <div className="w-full flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <Compass size={36} className="text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-500 hidden lg:block">Wijha</span>
                </Link>

                {/* Wijha Custom Pill Categories */}
                <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1.5 shadow-inner border border-neutral-200 dark:border-neutral-800">
                    <button 
                        onClick={() => setActiveTab('stays')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'stays' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Home size={18} /> Stays
                    </button>
                    <button 
                        onClick={() => setActiveTab('experiences')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'experiences' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <MapIcon size={18} /> Experiences
                    </button>
                    <button 
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Briefcase size={18} /> Services
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/host/onboarding" className="text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors hidden lg:block">
                        Switch to hosting
                    </Link>
                    <Link href="/login" className="flex items-center gap-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-full p-1 pl-4 hover:border-amber-500 transition-colors cursor-pointer bg-white dark:bg-neutral-900 shadow-sm group">
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 3, overflow: 'visible' }} className="text-neutral-500 group-hover:text-amber-500 transition-colors"><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
                        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                            <Users size={18} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Functional Search Bar */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 py-2 px-4 rounded-full flex flex-col lg:flex-row items-center max-w-5xl w-full shadow-xl hover:shadow-2xl transition-all cursor-pointer relative z-20">
                
                {/* Location */}
                <div className="flex items-center px-6 lg:border-r border-neutral-200 dark:border-neutral-800 w-full lg:w-1/3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors">
                    <div className="flex flex-col text-left w-full">
                        <label htmlFor="location" className="text-[10px] font-black text-neutral-900 dark:text-white tracking-widest uppercase mb-0.5">Where</label>
                        <input 
                            id="location"
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Search destinations" 
                            className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 font-bold text-sm w-full truncate" 
                        />
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center px-6 lg:border-r border-neutral-200 dark:border-neutral-800 w-full lg:w-1/3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors">
                    <div className="flex flex-col text-left w-full">
                        <label htmlFor="date" className="text-[10px] font-black text-neutral-900 dark:text-white tracking-widest uppercase mb-0.5">When</label>
                        <input 
                            id="date"
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 font-bold text-sm w-full truncate cursor-pointer" 
                        />
                    </div>
                </div>

                {/* Guests */}
                <div className="flex items-center pl-6 pr-2 w-full lg:w-1/3 justify-between py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors">
                    <div className="flex flex-col text-left">
                        <label htmlFor="guests" className="text-[10px] font-black text-neutral-900 dark:text-white tracking-widest uppercase mb-0.5">Who</label>
                        <input 
                            id="guests"
                            type="number" 
                            min="1"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                            placeholder="Add guests" 
                            className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 font-bold text-sm w-full truncate" 
                        />
                    </div>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-8 py-4 rounded-full flex items-center justify-center transition-all ml-4 shrink-0 shadow-lg shadow-amber-500/40 gap-2 font-black tracking-wide">
                        <Search size={18} strokeWidth={3} />
                        <span className="hidden xl:block">Search</span>
                    </button>
                </div>
            </form>
        </nav>
    );
}
