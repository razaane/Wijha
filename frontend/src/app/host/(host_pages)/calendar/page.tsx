"use client";

import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    X, MapPin, Loader2, Info, DollarSign, Lock, Unlock, Check,
    Image as ImageIcon, Home, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export default function HostCalendarPage() {
    const { user } = useAuthStore();
    const { formatConverted } = useCurrencyFormatter();
    const [listings, setListings] = useState<any[]>([]);
    const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isListingDropdownOpen, setIsListingDropdownOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'blocked'>('available');

    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [customPrice, setCustomPrice] = useState<string>('');

    // Fetch listings
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get('/listings/me');
                if (res.data?.status === 'success') {
                    const listingsArray = (res.data.data.data || []).filter((l: any) => !l.is_draft && l.type === 'rental');
                    setListings(listingsArray);
                    if (listingsArray.length > 0) {
                        setSelectedListingId(listingsArray[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch listings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Fetch calendar data when listing changes
    const fetchCalendarData = async () => {
        if (!selectedListingId) return;
        try {
            const res = await api.get(`/listings/${selectedListingId}/calendar`);
            if (res.data?.status === 'success') {
                setAvailabilities(res.data.data.availabilities || []);
            }
        } catch (err) {
            console.error("Failed to fetch calendar", err);
        }
    };

    // Calendar Logic
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    useEffect(() => {
        fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedListingId, currentMonth, currentYear]); // Also fetch if month changes if we implemented range filtering

    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
        setSelectedDates([]);
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
        setSelectedDates([]);
    };
    const goToday = () => {
        setCurrentDate(new Date());
        setSelectedDates([]);
    };

    const handleDateClick = (year: number, month: number, day: number) => {
        const clicked = new Date(year, month, day);
        const exists = selectedDates.some(d => d.getTime() === clicked.getTime());
        
        let newSelectedDates;
        if (exists) {
            newSelectedDates = selectedDates.filter(d => d.getTime() !== clicked.getTime());
        } else {
            newSelectedDates = [...selectedDates, clicked];
        }
        
        setSelectedDates(newSelectedDates);

        // Pre-fill sidebar inputs if exactly one date is selected
        if (newSelectedDates.length === 1) {
            const d = newSelectedDates[0];
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const avail = availabilities.find(a => a.date.startsWith(dateStr));
            setAvailabilityStatus(avail?.status || 'available');
            setCustomPrice(avail?.custom_price ? avail.custom_price.toString() : '');
        } else if (newSelectedDates.length === 0) {
            setAvailabilityStatus('available');
            setCustomPrice('');
        }
    };

    const isDateSelected = (year: number, month: number, day: number) => {
        return selectedDates.some(d => d.getTime() === new Date(year, month, day).getTime());
    };

    const isToday = (year: number, month: number, day: number) => {
        const t = new Date();
        return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
    };

    const isPast = (year: number, month: number, day: number) => {
        const d = new Date(year, month, day);
        const t = new Date(); t.setHours(0,0,0,0);
        return d < t;
    };

    const clearSelection = () => { setSelectedDates([]); setCustomPrice(''); };

    const getImageUrl = (listing: any) => {
        return getStorageUrl(listing.photo_urls?.[0]?.small || listing.photo_urls?.[0]?.original);
    };

    const selectedListing = listings.find(l => l.id === selectedListingId);

    // Save changes to API
    const saveChanges = async () => {
        if (!selectedListingId || selectedDates.length === 0) return;
        
        try {
            // Format dates to YYYY-MM-DD
            const formattedDates = selectedDates.map(d => {
                const tzOffset = d.getTimezoneOffset() * 60000;
                return (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
            });

            await api.put(`/listings/${selectedListingId}/calendar`, {
                dates: formattedDates,
                status: availabilityStatus,
                custom_price: customPrice ? parseFloat(customPrice) : null
            });
            
            // Refresh data
            await fetchCalendarData();
            clearSelection();
        } catch (err) {
            console.error("Failed to save calendar", err);
            alert("Failed to save changes.");
        }
    };

    // Helper to get day data
    const getDayData = (year: number, month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const avail = availabilities.find(a => a.date.startsWith(dateStr));
        return {
            status: avail?.status || 'available',
            price: avail?.custom_price || selectedListing?.price || 0
        };
    };

    // Generate second month data for the two-month view
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthYear = nextMonthDate.getFullYear();
    const nextMonthMonth = nextMonthDate.getMonth();
    const daysInNextMonth = new Date(nextMonthYear, nextMonthMonth + 1, 0).getDate();
    const firstDayOfNextMonth = new Date(nextMonthYear, nextMonthMonth, 1).getDay();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-6">
                    <CalendarIcon size={36} />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 mb-3">No listings yet</h2>
                <p className="text-neutral-500 max-w-md mb-8 text-lg">Create your first listing to start managing your availability calendar.</p>
                <Link href="/host/onboarding" className="px-8 py-3 bg-neutral-900 text-white rounded-full font-bold hover:bg-neutral-800 transition-colors">
                    Create a Listing
                </Link>
            </div>
        );
    }

    // Render a single month grid
    const renderMonthGrid = (
        monthName: string,
        year: number,
        month: number,
        days: number,
        firstDay: number
    ) => (
        <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-neutral-900 mb-5 text-center">
                {monthName} {year}
            </h3>
            
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {dayNames.map(d => (
                    <div key={d} className="text-center text-[11px] font-bold text-neutral-400 uppercase tracking-widest py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const selected = isDateSelected(year, month, day);
                    const today = isToday(year, month, day);
                    const past = isPast(year, month, day);
                    const data = getDayData(year, month, day);
                    const isBlocked = data.status === 'blocked';

                    return (
                        <button
                            key={day}
                            onClick={() => !past && handleDateClick(year, month, day)}
                            disabled={past}
                            className={`
                                relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 text-sm
                                ${past ? 'text-neutral-300 cursor-default' : 'cursor-pointer hover:bg-amber-50'}
                                ${isBlocked && !selected && !past ? 'bg-red-50 text-red-300 line-through' : ''}
                                ${selected ? 'bg-neutral-900 text-white shadow-lg scale-[1.02] z-10' : ''}
                                ${today && !selected ? 'ring-2 ring-amber-500 font-black text-amber-600' : ''}
                                ${!selected && !past && !today && !isBlocked ? 'text-neutral-800 hover:text-neutral-900' : ''}
                            `}
                        >
                            <span className={`font-bold ${selected ? 'text-white' : ''}`}>{day}</span>
                            {!past && data.price > 0 && (
                                <span className={`text-[10px] mt-0.5 ${selected ? 'text-neutral-300' : isBlocked ? 'text-red-300 line-through' : 'text-neutral-400'}`}>
                                    {formatConverted(data.price, selectedListing?.currency || 'USD')}
                                </span>
                            )}
                            {selected && (
                                <div className="absolute top-1 right-1">
                                    <Check size={10} strokeWidth={3} className="text-amber-400" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start h-[calc(100vh-80px-3rem)]">
            {/* Left Area: Calendar Grid */}
            <div className="flex-1 flex flex-col space-y-8 h-full overflow-y-auto w-full">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-1">Calendar</h1>
                        <p className="text-neutral-500 text-lg">Manage availability and pricing for your properties</p>
                    </div>

                    {/* Month Nav */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={goToday} className="px-4 py-2 text-sm font-bold bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 shadow-sm">
                            Today
                        </button>
                        <div className="flex items-center bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                            <button onClick={prevMonth} className="p-2.5 hover:bg-neutral-50 text-neutral-600 transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-4 font-bold text-neutral-900 text-sm min-w-[140px] text-center border-x border-neutral-100">
                                {monthNames[currentMonth]} {currentYear}
                            </span>
                            <button onClick={nextMonth} className="p-2.5 hover:bg-neutral-50 text-neutral-600 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                <motion.div 
                    layout
                    className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8"
                >
                    <div className="flex flex-col xl:flex-row gap-12">
                        {/* Current Month */}
                        {renderMonthGrid(
                            monthNames[currentMonth], currentYear, currentMonth,
                            daysInMonth, firstDayOfMonth
                        )}

                        {/* Divider */}
                        <div className="hidden xl:block w-px bg-neutral-100 self-stretch shrink-0" />

                        {/* Next Month */}
                        {renderMonthGrid(
                            monthNames[nextMonthMonth], nextMonthYear, nextMonthMonth,
                            daysInNextMonth, firstDayOfNextMonth
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <div className="w-3 h-3 rounded bg-neutral-900" /> Selected
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <div className="w-3 h-3 rounded ring-2 ring-amber-500" /> Today
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <div className="w-3 h-3 rounded bg-red-100" /> Blocked
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <div className="w-3 h-3 rounded bg-neutral-200" /> Past
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Action Sidebar */}
            <div className="w-full lg:w-[340px] shrink-0 sticky top-0 flex flex-col gap-4">
                {/* Listing Selector */}
                <div className="relative z-50">
                    <button 
                        onClick={() => setIsListingDropdownOpen(!isListingDropdownOpen)}
                        className="w-full flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all"
                    >
                        {selectedListing && (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                                    {getImageUrl(selectedListing) ? (
                                        <img src={getImageUrl(selectedListing)!} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400"><Home size={18} /></div>
                                    )}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-neutral-900 text-sm truncate">{selectedListing.title || 'Untitled Draft'}</p>
                                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                                        <MapPin size={10} /> {selectedListing.address_city || 'No location'}
                                    </p>
                                </div>
                            </div>
                        )}
                        <ChevronDown size={18} className={`text-neutral-400 shrink-0 transition-transform ${isListingDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isListingDropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
                            >
                                {listings.map(listing => (
                                    <button
                                        key={listing.id}
                                        onClick={() => {
                                            setSelectedListingId(listing.id);
                                            setIsListingDropdownOpen(false);
                                            clearSelection();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left ${listing.id === selectedListingId ? 'bg-amber-50' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                                            {getImageUrl(listing) ? (
                                                <img src={getImageUrl(listing)!} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-400"><Home size={18} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-neutral-900 truncate">{listing.title || 'Untitled Draft'}</p>
                                            <p className="text-xs text-neutral-500 truncate">{listing.address_city || 'No location'}</p>
                                        </div>
                                        {listing.id === selectedListingId && <Check size={16} className="text-amber-500 shrink-0" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Edit Panel */}
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex-1">
                    <div className="p-5 bg-neutral-900 text-white flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base">Edit Dates</h3>
                            <p className="text-neutral-400 text-xs mt-0.5">{selectedListing?.title || 'Untitled Draft'}</p>
                        </div>
                        {selectedDates.length > 0 && (
                            <button onClick={clearSelection} className="text-xs font-bold text-amber-500 hover:text-amber-400">
                                Clear
                            </button>
                        )}
                    </div>
                    
                    <div className="p-6">
                        {selectedDates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-12 text-neutral-400">
                                <CalendarIcon size={48} className="mb-4 opacity-50" />
                                <p className="font-medium text-sm max-w-[200px]">Select dates on the calendar to edit availability and pricing.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Selected count */}
                                <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3 border border-amber-100">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <CalendarIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-amber-800 text-lg leading-tight">
                                            {selectedDates.length} {selectedDates.length === 1 ? 'night' : 'nights'}
                                        </p>
                                        <p className="text-amber-600 text-xs font-bold">selected</p>
                                    </div>
                                </div>

                                {/* Availability Toggle */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-3">Availability</label>
                                    <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1.5 rounded-2xl">
                                        <button 
                                            onClick={() => setAvailabilityStatus('available')}
                                            className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${availabilityStatus === 'available' ? 'bg-white shadow-sm text-emerald-600 border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'}`}
                                        >
                                            <Unlock size={14} /> Open
                                        </button>
                                        <button 
                                            onClick={() => setAvailabilityStatus('blocked')}
                                            className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${availabilityStatus === 'blocked' ? 'bg-white shadow-sm text-red-600 border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'}`}
                                        >
                                            <Lock size={14} /> Blocked
                                        </button>
                                    </div>
                                </div>

                                {/* Custom Price */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-3">Custom Nightly Price</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                            <DollarSign size={18} />
                                        </div>
                                        <input 
                                            type="number" 
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            placeholder={`Base: ${formatConverted(selectedListing?.price || 0, selectedListing?.currency || 'USD')}`}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-neutral-400 mt-2 flex items-start gap-1">
                                        <Info size={12} className="shrink-0 mt-0.5" />
                                        Leave blank to reset to base price
                                    </p>
                                </div>

                                {/* Action button */}
                                <button 
                                    onClick={saveChanges}
                                    className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold transition-colors shadow-sm mt-4"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
