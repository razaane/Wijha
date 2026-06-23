'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Search, Users, Home, Map as MapIcon, Briefcase, UserCircle, LogOut, LayoutDashboard, Settings, Navigation } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Category } from './LandingClient';

interface HeaderProps {
    activeCategory: Category;
    setActiveCategory: (c: Category) => void;
}

export default function Header({ activeCategory, setActiveCategory }: HeaderProps) {
    const router = useRouter();
    const { isAuthenticated, user, fetchUser, logout } = useAuthStore();
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set('type', activeCategory === 'experiences' ? 'event' : 'rental');
        if (location) params.set('location', location);
        if (date) params.set('date', date);
        if (guests > 1 && activeCategory === 'stays') params.set('guests', guests.toString());
        
        router.push(`/browse?${params.toString()}`);
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        router.refresh();
    };

    return (
        <nav className="w-full bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center pt-4 pb-8 px-4 md:px-8 xl:px-16 relative z-50">
            
            {/* Top Row: Logo, Pill Categories, User Actions */}
            <div className="w-full flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <Compass size={36} className="text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-500 hidden lg:block">Wijha</span>
                </Link>

                {/* Wijha Custom Pill Categories */}
                <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1.5 shadow-inner border border-neutral-200 dark:border-neutral-800">
                    <button 
                        onClick={() => setActiveCategory('stays')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === 'stays' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Home size={18} /> Stays
                    </button>
                    <button 
                        onClick={() => setActiveCategory('experiences')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === 'experiences' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <MapIcon size={18} /> Experiences
                    </button>
                    <button 
                        onClick={() => setActiveCategory('services')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === 'services' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Briefcase size={18} /> Services
                    </button>
                </div>

                {/* Auth Menu */}
                <div className="flex items-center gap-4 relative" ref={menuRef}>
                    <Link href="/host/onboarding" className="text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors hidden lg:block">
                        Switch to hosting
                    </Link>
                    
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 border border-neutral-200 dark:border-neutral-700 rounded-full p-1.5 pl-4 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-neutral-900 shadow-sm"
                    >
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 3, overflow: 'visible' }} className="text-neutral-500"><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                            {isAuthenticated && user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={20} />
                            )}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-[120%] right-0 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 py-2 overflow-hidden flex flex-col z-50">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                                        <p className="font-bold text-neutral-900 dark:text-white truncate">{user?.name}</p>
                                        <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
                                    </div>
                                    <Link href="/dashboard/stays" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                    <Link href="/trips" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <Navigation size={18} /> My Trips
                                    </Link>
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <Settings size={18} /> Settings
                                    </Link>
                                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                                    <button onClick={handleLogout} className="px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium text-red-500 text-left w-full">
                                        <LogOut size={18} /> Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-bold text-neutral-900 dark:text-white">
                                        Log in
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Sign up
                                    </Link>
                                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                                    <Link href="/host/onboarding" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Host your home
                                    </Link>
                                    <Link href="#" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Host an experience
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Functional Search Bar */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2 px-4 rounded-full flex flex-col lg:flex-row items-center max-w-5xl w-full shadow-lg hover:shadow-xl transition-all cursor-pointer relative z-20">
                
                {/* Location */}
                <div className="flex items-center px-6 lg:border-r border-neutral-200 dark:border-neutral-800 w-full lg:w-1/3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors">
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
                <div className="flex items-center px-6 lg:border-r border-neutral-200 dark:border-neutral-800 w-full lg:w-1/3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors">
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

                {/* Guests / Tickets */}
                <div className="flex items-center pl-6 pr-2 w-full lg:w-1/3 justify-between py-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors">
                    <div className="flex flex-col text-left">
                        <label htmlFor="guests" className="text-[10px] font-black text-neutral-900 dark:text-white tracking-widest uppercase mb-0.5">
                            {activeCategory === 'experiences' ? 'Tickets' : 'Who'}
                        </label>
                        <input 
                            id="guests"
                            type="number" 
                            min="1"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                            placeholder={activeCategory === 'experiences' ? 'Add tickets' : 'Add guests'} 
                            className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 font-bold text-sm w-full truncate" 
                        />
                    </div>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-8 py-4 rounded-full flex items-center justify-center transition-all ml-4 shrink-0 shadow-lg shadow-amber-500/30 gap-2 font-black tracking-wide">
                        <Search size={18} strokeWidth={3} />
                        <span className="hidden xl:block">Search</span>
                    </button>
                </div>
            </form>
        </nav>
    );
}
