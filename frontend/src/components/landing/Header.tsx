'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Search, Users, Home, Map as MapIcon, Briefcase, UserCircle, LogOut, LayoutDashboard, Settings, Navigation, Globe, MapPin, Building2, Umbrella, Anchor, Minus, Plus, ChevronLeft, ChevronRight, Building, Ticket, SlidersHorizontal, X, User, Heart, MessageSquare, Plane } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useMessageStore } from '@/store/message.store';
import { getStorageUrl } from '@/lib/url';
import { Category } from './LandingClient';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays, isBefore, startOfDay, isAfter, isWithinInterval } from 'date-fns';
import FiltersModal from './FiltersModal';
import HostSelectionModal from '../HostSelectionModal';

interface HeaderProps {
    activeCategory?: Category;
    setActiveCategory?: (c: Category) => void;
    isCompact?: boolean;
    searchQuery?: {
        location?: string | null;
        eventName?: string | null;
        checkIn?: string | null;
        checkOut?: string | null;
        guests?: string | null;
    };
    hideSearch?: boolean;
}

const SUGGESTED_DESTINATIONS = [
    { city: 'Marrakech', country: 'Morocco', desc: 'For sights like Majorelle Garden', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { city: 'Casablanca', country: 'Morocco', desc: 'For a trip abroad', icon: Building, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { city: 'Rabat', country: 'Morocco', desc: 'For a trip abroad', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { city: 'Agadir', country: 'Morocco', desc: 'Popular beach destination', icon: Umbrella, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { city: 'Tangier', country: 'Morocco', desc: 'Great for summer getaways', icon: Anchor, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
];

export default function Header({ activeCategory, setActiveCategory, isCompact = false, searchQuery, hideSearch = false }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, fetchUser, logout } = useAuthStore();
    const { unreadCount } = useMessageStore();
    
    // Auth Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHostModalOpen, setIsHostModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Search Popovers State
    const [activePopover, setActivePopover] = useState<'location' | 'date' | 'guests' | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Form State
    const [location, setLocation] = useState(searchQuery?.location || '');
    const [eventName, setEventName] = useState(searchQuery?.eventName || '');
    
    // Date State
    const [checkIn, setCheckIn] = useState<Date | null>(searchQuery?.checkIn ? new Date(searchQuery.checkIn + 'T00:00:00') : null);
    const [checkOut, setCheckOut] = useState<Date | null>(searchQuery?.checkOut ? new Date(searchQuery.checkOut + 'T00:00:00') : null);
    const [datePickerFocus, setDatePickerFocus] = useState<'checkin' | 'checkout'>('checkin');
    const [currentMonth, setCurrentMonth] = useState(searchQuery?.checkIn ? startOfMonth(new Date(searchQuery.checkIn + 'T00:00:00')) : startOfMonth(new Date()));
    
    // Guests State
    const [adults, setAdults] = useState(searchQuery?.guests ? parseInt(searchQuery.guests) : 1);
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
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false);
                setActivePopover(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isExpanded]);

    const handleSearch = (e: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        setActivePopover(null);
        setIsExpanded(false);
        
        const params = new URLSearchParams();
        params.set('type', activeCategory === 'stays' ? 'rental' : (activeCategory === 'experiences' ? 'experience' : 'event'));
        if (location) params.set('location', location);
        if (activeCategory === 'events' && eventName) params.set('q', eventName);
        if (checkIn) params.set('check_in', format(checkIn, 'yyyy-MM-dd'));
        if (checkOut) params.set('check_out', format(checkOut, 'yyyy-MM-dd'));
        if (totalGuests > 1 && activeCategory === 'stays') params.set('guests', totalGuests.toString());
        
        router.push(`/browse?${params.toString()}`);
    };

    const hasActiveSearch = Boolean(searchQuery?.location || searchQuery?.eventName || searchQuery?.checkIn || searchQuery?.checkOut || (searchQuery?.guests && parseInt(searchQuery.guests) > 1));

    const handleClearSearch = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLocation('');
        setEventName('');
        setCheckIn(null);
        setCheckOut(null);
        setAdults(1);
        setChildren(0);
        setInfants(0);
        setPets(0);
        setActivePopover(null);
        setIsExpanded(false);
        router.push(`/browse?type=${activeCategory === 'stays' ? 'rental' : (activeCategory === 'experiences' ? 'experience' : 'event')}`);
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        router.push('/');
    };

    const handleCategoryClick = (category: 'all' | 'stays' | 'events' | 'experiences') => {
        if (pathname === '/') {
            setActiveCategory?.(category);
        } else {
            router.push('/');
        }
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
                const isCheckIn = checkIn && isSameDay(day, checkIn);
                const isCheckOut = checkOut && isSameDay(day, checkOut);
                const isPast = isBefore(day, startOfDay(new Date()));
                const isInRange = checkIn && checkOut && isCurrentMonth && !isPast && 
                    isAfter(day, checkIn) && isBefore(day, checkOut);

                days.push(
                    <div 
                        key={day.toString()} 
                        className={`flex justify-center items-center w-10 h-10 text-sm font-semibold transition-all cursor-pointer relative
                            ${!isCurrentMonth ? 'text-transparent pointer-events-none' : ''}
                            ${isCurrentMonth && isPast ? 'text-neutral-300 dark:text-neutral-600 pointer-events-none line-through decoration-1' : ''}
                            ${isInRange ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                            ${isCheckIn || isCheckOut ? 'bg-amber-500 text-white rounded-full z-10' : ''}
                            ${isCurrentMonth && !isPast && !isCheckIn && !isCheckOut ? 'text-neutral-900 dark:text-neutral-100 hover:border hover:border-neutral-900 dark:hover:border-white rounded-full' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth && !isPast) {
                                if (datePickerFocus === 'checkin') {
                                    setCheckIn(cloneDay);
                                    setCheckOut(null);
                                    setDatePickerFocus('checkout');
                                } else {
                                    if (checkIn && isBefore(cloneDay, checkIn)) {
                                        setCheckIn(cloneDay);
                                        setCheckOut(null);
                                    } else {
                                        setCheckOut(cloneDay);
                                        setDatePickerFocus('checkin');
                                        setActivePopover('guests');
                                    }
                                }
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
        <nav className={`w-full bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center pt-4 px-4 md:px-8 xl:px-16 relative z-50 ${hideSearch ? 'pb-4' : 'pb-8'}`}>
            
            {/* Background Dimmer when Popover is open or search is expanded */}
            {(activePopover || isExpanded) && (
                <div 
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[-1] transition-opacity" 
                    onClick={() => {
                        setActivePopover(null);
                        setIsExpanded(false);
                    }}
                ></div>
            )}

            {/* Top Row: Logo, Pill Categories, User Actions */}
            <div className={`w-full flex items-center justify-between ${hideSearch ? '' : 'mb-8'}`}>
                <Link href="/" className="flex items-center gap-2">
                    <Compass size={36} className="text-amber-500" />
                    <span className="text-3xl font-black tracking-tight text-amber-500 hidden lg:block">Wijha</span>
                </Link>

                {/* Wijha Custom Pill Categories */}
                <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1.5 shadow-inner border border-neutral-200 dark:border-neutral-800 overflow-x-auto hide-scrollbar max-w-full">
                    <button 
                        onClick={() => handleCategoryClick('all')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${pathname === '/' && activeCategory === 'all' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Globe size={18} /> All
                    </button>
                    <button 
                        onClick={() => handleCategoryClick('stays')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${pathname === '/' && activeCategory === 'stays' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Home size={18} /> Stays
                    </button>
                    <button 
                        onClick={() => handleCategoryClick('events')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${pathname === '/' && activeCategory === 'events' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Ticket size={18} /> Events
                    </button>
                    <button 
                        onClick={() => handleCategoryClick('experiences')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${pathname === '/' && activeCategory === 'experiences' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <MapIcon size={18} /> Experiences
                    </button>
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                    <Link 
                        href="/transport"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${pathname.startsWith('/transport') ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-md scale-105' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                    >
                        <Plane size={18} /> Transport
                    </Link>
                </div>

                {/* Auth Menu */}
                <div className="flex items-center gap-4 relative" ref={menuRef}>

                    
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 border border-neutral-200 dark:border-neutral-700 rounded-full p-1.5 pl-4 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-neutral-900 shadow-sm relative"
                    >
                        {unreadCount > 0 && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#0a0a0a] rounded-full z-10"></div>
                        )}
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 3, overflow: 'visible' }} className="text-neutral-500"><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                            {isAuthenticated && user?.avatar ? (
                                <img src={getStorageUrl(user.avatar)} alt="Profile" className="w-full h-full object-cover" />
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
                                        <User size={18} /> Profile
                                    </Link>
                                    <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <Heart size={18} /> Favorites
                                    </Link>
                                    <Link href="/messages" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={18} /> Messages
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        <Settings size={18} /> Settings
                                    </Link>
                                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                                    {user?.is_verified_host ? (
                                        <Link href="/host/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            <Compass size={18} /> Switch to hosting
                                        </Link>
                                    ) : (
                                        <button onClick={() => { setIsMenuOpen(false); setIsHostModalOpen(true); }} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 w-full text-left">
                                            <Building size={18} /> Become a host
                                        </button>
                                    )}
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
            {!hideSearch && (
                <div className="relative z-40" ref={searchRef}>
                    {isCompact && !isExpanded ? (
                        <div className="flex items-center gap-4 max-w-3xl mx-auto w-full transition-all">
                        <div 
                            onClick={() => {
                                setIsExpanded(true);
                                setActivePopover('location');
                            }}
                            className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-2 flex-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-[#1a1a1a]"
                        >
                            <div className="flex items-center divide-x divide-neutral-200 dark:divide-neutral-700 w-full">
                                {activeCategory === 'events' && (
                                    <div className="px-4 font-bold text-sm text-neutral-900 dark:text-white truncate">
                                        {searchQuery?.eventName || eventName || 'All Events'}
                                    </div>
                                )}
                                <div className="px-4 font-bold text-sm text-neutral-900 dark:text-white truncate">
                                    {searchQuery?.location || location || 'Anywhere'}
                                </div>
                                <div className="px-4 font-bold text-sm text-neutral-900 dark:text-white truncate">
                                    {searchQuery?.checkIn && searchQuery?.checkOut 
                                        ? `${format(new Date(searchQuery.checkIn), 'MMM d')} - ${format(new Date(searchQuery.checkOut), 'MMM d')}` 
                                        : checkIn && checkOut ? `${format(checkIn, 'MMM d')} - ${format(checkOut, 'MMM d')}` : 'Any time'}
                                </div>
                                {activeCategory !== 'events' && (
                                    <div className="px-4 text-sm text-neutral-500 truncate flex-1">
                                        {searchQuery?.guests ? `${searchQuery.guests} guest${parseInt(searchQuery.guests) > 1 ? 's' : ''}` : totalGuests > 0 ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` : 'Add guests'}
                                    </div>
                                )}
                            </div>
                            <button className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full p-2.5 transition-all shrink-0">
                                <Search size={16} strokeWidth={3} />
                            </button>
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsFiltersOpen(true);
                            }}
                            className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 rounded-full px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm bg-white dark:bg-[#1a1a1a] font-bold text-sm shrink-0"
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                        {hasActiveSearch && (
                            <button 
                                type="button"
                                onClick={handleClearSearch}
                                className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-3 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:border-rose-900/50 transition-colors shadow-sm bg-white dark:bg-[#1a1a1a] font-bold text-sm shrink-0"
                            >
                                <X size={16} />
                                Clear
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={`border border-neutral-200 dark:border-neutral-800 rounded-full flex flex-col lg:flex-row items-stretch max-w-4xl mx-auto w-full transition-all relative
                        ${activePopover ? 'bg-neutral-200 dark:bg-neutral-900 shadow-none' : 'bg-neutral-100 dark:bg-neutral-800 shadow-md'}`}
                        style={{ height: '66px' }}
                    >
                    
                    {activeCategory === 'events' && (
                        <>
                            {/* What Button */}
                            <div 
                                onClick={() => setActivePopover('location')} // Reuse location popover focus or create a new one, but for now just focus input
                                className={`flex flex-col justify-center text-left px-8 w-full lg:w-[35%] rounded-full transition-all cursor-text relative z-10 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80`}
                            >
                                <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase">What</span>
                                <input 
                                    type="text" 
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    placeholder="Search events, festivals..." 
                                    className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 font-medium text-sm w-full truncate" 
                                />
                            </div>

                            {/* Divider */}
                            <div className={`hidden lg:flex items-center shrink-0 transition-opacity opacity-100`}>
                                <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-700"></div>
                            </div>
                        </>
                    )}

                    {/* Location Button */}
                    <div 
                        onClick={() => setActivePopover('location')}
                        className={`flex flex-col justify-center text-left px-8 w-full ${activeCategory === 'events' ? 'lg:w-[30%]' : 'lg:w-[30%]'} rounded-full transition-all cursor-pointer relative z-10
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
                        onClick={() => { setActivePopover('date'); if (!checkIn) setDatePickerFocus('checkin'); }}
                        className={`flex flex-col justify-center text-left px-8 w-full ${activeCategory === 'events' ? 'lg:flex-1 pl-8 pr-2 flex-row justify-between items-center' : 'lg:w-[35%]'} rounded-full transition-all cursor-pointer relative z-10
                        ${activePopover === 'date' ? 'bg-white dark:bg-[#1a1a1a] shadow-[0_6px_20px_rgba(0,0,0,0.08)]' : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'}`}
                    >
                        <div className="flex flex-col justify-center text-left">
                            <span className="text-[11px] font-black text-neutral-900 dark:text-white tracking-widest mb-0.5 uppercase whitespace-nowrap">When</span>
                            <span className={`font-medium text-sm w-full truncate ${checkIn || checkOut ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                                {checkIn && checkOut 
                                    ? `${format(checkIn, 'MMM d')} - ${format(checkOut, 'MMM d')}` 
                                    : checkIn 
                                        ? `${format(checkIn, 'MMM d')} - Add dates` 
                                        : 'Any time'}
                            </span>
                        </div>
                        {activeCategory === 'events' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSearch(e); }} 
                                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg shadow-amber-500/30 gap-2 font-black tracking-wide"
                                style={{ height: '48px', width: '48px', minWidth: 'auto' }}
                            >
                                <Search size={18} strokeWidth={3} />
                            </button>
                        )}
                    </div>

                    {activeCategory !== 'events' && (
                        <>
                            {/* Divider 3 */}
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
                        </>
                    )}
                </div>
                )}

                {/* ---------------- POPOVERS ---------------- */}

                {/* Location Popover */}
                {activePopover === 'location' && (
                    <div className="absolute top-[120%] left-0 w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-[9999]">
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
                    <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 z-[9999]" style={{ width: '450px' }}>
                        
                        {/* Check-in / Check-out Summary */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <button 
                                onClick={() => setDatePickerFocus('checkin')}
                                className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 transition-all ${datePickerFocus === 'checkin' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-neutral-200 dark:border-neutral-700'}`}
                            >
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Check in</span>
                                <span className={`text-sm font-bold ${checkIn ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                                    {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                                </span>
                            </button>
                            <div className="w-8 h-px bg-neutral-300 dark:bg-neutral-700"></div>
                            <button 
                                onClick={() => setDatePickerFocus('checkout')}
                                className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 transition-all ${datePickerFocus === 'checkout' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-neutral-200 dark:border-neutral-700'}`}
                            >
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Check out</span>
                                <span className={`text-sm font-bold ${checkOut ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                                    {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                                </span>
                            </button>
                        </div>

                        {/* Calendar Body */}
                        <div className="flex flex-col items-center relative px-8">
                            <div className="w-full flex justify-between absolute top-0 px-4">
                                <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            
                            {renderCalendarMonth(currentMonth)}
                        </div>

                        {/* Footer with Clear and Duration */}
                        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
                            <button 
                                onClick={() => { setCheckIn(null); setCheckOut(null); setDatePickerFocus('checkin'); }}
                                className="text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 transition-colors"
                            >
                                Clear dates
                            </button>
                            {checkIn && checkOut && (
                                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                    {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Guests Popover */}
                {activePopover === 'guests' && (
                    <div className="absolute top-[120%] right-0 w-full max-w-[400px] bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-[9999]">
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
            )}

            {/* Filters Modal */}
            <FiltersModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />

            {/* Host Selection Modal */}
            <HostSelectionModal isOpen={isHostModalOpen} onClose={() => setIsHostModalOpen(false)} />
        </nav>
    );
}
