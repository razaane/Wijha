'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Search, Users, Home, Map as MapIcon, Briefcase, UserCircle, LogOut, LayoutDashboard, Settings, Navigation, Globe, MapPin, Building2, Umbrella, Anchor, Minus, Plus, ChevronLeft, ChevronRight, Building, Ticket } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Category } from './LandingClient';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays, isBefore, startOfDay } from 'date-fns';

interface HeaderProps {
    activeCategory: Category;
    setActiveCategory: (c: Category) => void;
}

const SUGGESTED_DESTINATIONS = [
    { city: 'Marrakech', country: 'Morocco', desc: 'For sights like Majorelle Garden', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { city: 'Casablanca', country: 'Morocco', desc: 'For a trip abroad', icon: Building, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { city: 'Rabat', country: 'Morocco', desc: 'For a trip abroad', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { city: 'Agadir', country: 'Morocco', desc: 'Popular beach destination', icon: Umbrella, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { city: 'Tangier', country: 'Morocco', desc: 'Great for summer getaways', icon: Anchor, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
];

export default function Header({ activeCategory, setActiveCategory }: HeaderProps) {
    const router = useRouter();
    const { isAuthenticated, user, fetchUser, logout } = useAuthStore();
    
    // Auth Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Search Popovers State
    const [activePopover, setActivePopover] = useState<'location' | 'date' | 'guests' | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Form State
    const [location, setLocation] = useState('');
    
    // Date State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    
    // Guests State
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);

    const totalGuests = adults + children; // API expects total guests, infants/pets often excluded from strict count but tracked

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setActivePopover(null);
        
        const params = new URLSearchParams();
        params.set('type', activeCategory === 'experiences' ? 'event' : 'rental');
        if (location) params.set('location', location);
        if (selectedDate) params.set('date', format(selectedDate, 'yyyy-MM-dd'));
        if (totalGuests > 1 && activeCategory === 'stays') params.set('guests', totalGuests.toString());
        
        router.push(`/browse?${params.toString()}`);
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        router.refresh();
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    // Calendar Renderer
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
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isPast = isBefore(day, startOfDay(new Date()));

                days.push(
                    <div 
                        key={day.toString()} 
                        className={`flex justify-center items-center w-10 h-10 rounded-full text-sm font-semibold transition-all cursor-pointer
                            ${!isCurrentMonth ? 'text-transparent pointer-events-none' : ''}
                            ${isCurrentMonth && isPast ? 'text-neutral-300 dark:text-neutral-600 pointer-events-none line-through decoration-1' : ''}
                            ${isCurrentMonth && !isPast && !isSelected ? 'text-neutral-900 dark:text-neutral-100 hover:border hover:border-neutral-900 dark:hover:border-white' : ''}
                            ${isSelected ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth && !isPast) {
                                setSelectedDate(cloneDay);
                                setActivePopover('guests'); // Auto-advance
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
        <nav className="w-full bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center pt-4 pb-8 px-4 md:px-8 xl:px-16 relative z-50">
            
            {/* Top Row: Logo, Pill Categories, User Actions */}
            <div className="w-full flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <Compass size={36} className="text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-500 hidden lg:block">Wijha</span>
                </Link>

                {/* Wijha Custom Pill Categories */}
                <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1.5 shadow-inner border border-neutral-200 dark:border-neutral-800 overflow-x-auto hide-scrollbar max-w-full">
                    <button 
                        onClick={() => setActiveCategory('all')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Globe size={18} /> All
                    </button>
                    <button 
                        onClick={() => setActiveCategory('stays')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'stays' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Home size={18} /> Stays
                    </button>
                    <button 
                        onClick={() => setActiveCategory('events')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'events' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Ticket size={18} /> Events
                    </button>
                    <button 
                        onClick={() => setActiveCategory('experiences')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'experiences' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <MapIcon size={18} /> Experiences
                    </button>
                </div>

                {/* Auth Menu */}
                <div className="flex items-center gap-4 relative" ref={menuRef}>
                    {isAuthenticated ? (
                        <Link href={user?.role === 'host' ? '/host/dashboard' : '/host/onboarding'} className="text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors hidden lg:block">
                            {user?.role === 'host' ? 'Switch to hosting' : 'Become a host'}
                        </Link>
                    ) : (
                        <Link href="/host/onboarding" className="text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors hidden lg:block">
                            Become a host
                        </Link>
                    )}
                    
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

            {/* Functional Search Bar with Popovers */}
            <div className="relative z-40" ref={searchRef}>
                {/* Background Dimmer when Popover is open */}
                {activePopover && (
                    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[-1]" onClick={() => setActivePopover(null)}></div>
                )}

                <div className={`border border-neutral-200 dark:border-neutral-800 rounded-full flex flex-col lg:flex-row items-stretch max-w-4xl mx-auto w-full transition-all relative
                    ${activePopover ? 'bg-neutral-200 dark:bg-neutral-900 shadow-none' : 'bg-neutral-100 dark:bg-neutral-800 shadow-md'}`}
                    style={{ height: '66px' }}
                >
                    
                    {/* Location Button */}
                    <div 
                        onClick={() => setActivePopover('location')}
                        className={`flex flex-col justify-center text-left px-8 w-full lg:w-[35%] rounded-full transition-all cursor-pointer relative z-10
                        ${activePopover === 'location' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                    >
                        <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">Where</span>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Search destinations" 
                            className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 font-medium text-sm w-full truncate" 
                        />
                    </div>

                    {/* Divider 1 */}
                    <div className={`hidden lg:flex items-center shrink-0 transition-opacity ${activePopover === 'location' || activePopover === 'date' ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                    </div>

                    {/* Date Button */}
                    <div 
                        onClick={() => setActivePopover('date')}
                        className={`flex flex-col justify-center text-left px-8 w-full lg:w-[25%] rounded-full transition-all cursor-pointer relative z-10
                        ${activePopover === 'date' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                    >
                        <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">When</span>
                        <span className={`font-medium text-sm w-full truncate ${selectedDate ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Add dates'}
                        </span>
                    </div>

                    {/* Divider 2 */}
                    <div className={`hidden lg:flex items-center shrink-0 transition-opacity ${activePopover === 'date' || activePopover === 'guests' ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                    </div>

                    {/* Guests / Tickets Button + Search */}
                    <div 
                        className={`flex items-center pl-8 w-full lg:flex-1 justify-between rounded-full transition-all cursor-pointer relative z-10
                        ${activePopover === 'guests' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                        onClick={() => setActivePopover('guests')}
                    >
                        <div className="flex flex-col justify-center text-left">
                            <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">
                                {activeCategory === 'experiences' ? 'Tickets' : 'Who'}
                            </span>
                            <span className={`font-medium text-sm truncate ${totalGuests > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                                {totalGuests > 0 ? `${totalGuests} ${activeCategory === 'experiences' ? 'ticket' : 'guest'}${totalGuests > 1 ? 's' : ''}` : (activeCategory === 'experiences' ? 'Add tickets' : 'Add guests')}
                            </span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleSearch(e); }} 
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg shadow-amber-500/30 gap-2 font-black tracking-wide mx-2"
                            style={{ height: '48px', width: '48px', minWidth: 'auto' }}
                        >
                            <Search size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* ---------------- POPOVERS ---------------- */}

                {/* Location Popover */}
                {activePopover === 'location' && (
                    <div className="absolute top-[120%] left-0 w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-50">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 pl-2">Suggested destinations</h3>
                        <div className="flex flex-col gap-1">
                            {SUGGESTED_DESTINATIONS.map((dest, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => {
                                        setLocation(`${dest.city}, ${dest.country}`);
                                        setActivePopover('date'); // auto advance
                                    }}
                                    className="flex items-center gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-all w-full text-left group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dest.bg} ${dest.color} group-hover:scale-110 transition-transform`}>
                                        <dest.icon size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-neutral-900 dark:text-white">{dest.city}, {dest.country}</span>
                                        <span className="text-sm text-neutral-500">{dest.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date Popover */}
                {activePopover === 'date' && (
                    <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-full max-w-[850px] bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 z-50">
                        
                        {/* Tabs for Date/Flexible */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-1.5 flex gap-1">
                                <button className="px-6 py-2 bg-white dark:bg-neutral-900 rounded-full font-bold shadow-sm text-neutral-900 dark:text-white text-sm">Dates</button>
                                <button className="px-6 py-2 rounded-full font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm">Flexible</button>
                            </div>
                        </div>

                        {/* Calendar Body */}
                        <div className="flex items-start justify-between relative px-4">
                            <button onClick={prevMonth} className="absolute left-0 top-0 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                            
                            {renderCalendarMonth(currentMonth)}
                            <div className="hidden md:block">
                                {renderCalendarMonth(addMonths(currentMonth, 1))}
                            </div>

                            <button onClick={nextMonth} className="absolute right-0 top-0 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"><ChevronRight size={20} /></button>
                        </div>

                        {/* Options */}
                        <div className="mt-8 flex justify-center gap-3 overflow-x-auto pb-2">
                            {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days'].map(opt => (
                                <button key={opt} className={`px-4 py-2 border rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                                    ${opt === 'Exact dates' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-white'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Guests Popover */}
                {activePopover === 'guests' && (
                    <div className="absolute top-[120%] right-0 w-full max-w-[400px] bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-50">
                        <div className="flex flex-col gap-6">
                            
                            {/* Adults */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-900 dark:text-white">Adults</span>
                                    <span className="text-sm text-neutral-500">Ages 13 or above</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${adults <= 1 ? 'border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700 cursor-not-allowed' : 'border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white'}`}
                                        disabled={adults <= 1}
                                    ><Minus size={14} strokeWidth={3} /></button>
                                    <span className="w-4 text-center font-semibold">{adults}</span>
                                    <button 
                                        onClick={() => setAdults(adults + 1)}
                                        className="w-8 h-8 rounded-full border border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                    ><Plus size={14} strokeWidth={3} /></button>
                                </div>
                            </div>

                            <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800"></div>

                            {/* Children */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-900 dark:text-white">Children</span>
                                    <span className="text-sm text-neutral-500">Ages 2 – 12</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${children <= 0 ? 'border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700 cursor-not-allowed' : 'border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white'}`}
                                        disabled={children <= 0}
                                    ><Minus size={14} strokeWidth={3} /></button>
                                    <span className="w-4 text-center font-semibold">{children}</span>
                                    <button 
                                        onClick={() => setChildren(children + 1)}
                                        className="w-8 h-8 rounded-full border border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                    ><Plus size={14} strokeWidth={3} /></button>
                                </div>
                            </div>

                            <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800"></div>

                            {/* Infants */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-900 dark:text-white">Infants</span>
                                    <span className="text-sm text-neutral-500">Under 2</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setInfants(Math.max(0, infants - 1))}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${infants <= 0 ? 'border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700 cursor-not-allowed' : 'border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white'}`}
                                        disabled={infants <= 0}
                                    ><Minus size={14} strokeWidth={3} /></button>
                                    <span className="w-4 text-center font-semibold">{infants}</span>
                                    <button 
                                        onClick={() => setInfants(infants + 1)}
                                        className="w-8 h-8 rounded-full border border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                    ><Plus size={14} strokeWidth={3} /></button>
                                </div>
                            </div>

                            <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800"></div>

                            {/* Pets */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-900 dark:text-white">Pets</span>
                                    <span className="text-sm text-neutral-500 hover:underline cursor-pointer">Bringing a service animal?</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setPets(Math.max(0, pets - 1))}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${pets <= 0 ? 'border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700 cursor-not-allowed' : 'border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white'}`}
                                        disabled={pets <= 0}
                                    ><Minus size={14} strokeWidth={3} /></button>
                                    <span className="w-4 text-center font-semibold">{pets}</span>
                                    <button 
                                        onClick={() => setPets(pets + 1)}
                                        className="w-8 h-8 rounded-full border border-neutral-400 text-neutral-600 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                    ><Plus size={14} strokeWidth={3} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
