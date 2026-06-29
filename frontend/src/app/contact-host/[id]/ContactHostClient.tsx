'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/landing/Header';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { useAuthStore } from '@/store/auth.store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
export default function ContactHostClient({ id }: { id: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    
    const [listing, setListing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Read params from URL
    const checkInParam = searchParams.get('check_in');
    const checkOutParam = searchParams.get('check_out');
    const guestsParam = searchParams.get('guests') || searchParams.get('adults');
    
    const [checkInStr, setCheckInStr] = useState<string>(checkInParam || format(new Date(), 'yyyy-MM-dd'));
    const [checkOutStr, setCheckOutStr] = useState<string>(checkOutParam || format(addDays(new Date(), 5), 'yyyy-MM-dd'));
    const [adults, setAdults] = useState(Number(guestsParam) || 1);
    const [childrenCount, setChildrenCount] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const totalGuests = adults + childrenCount;

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
    const bookingWidgetRef = useRef<HTMLDivElement>(null);

    const { formatConverted } = useCurrencyFormatter();

    // Auth guard
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (bookingWidgetRef.current && !bookingWidgetRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
                setIsGuestPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchListing = async () => {
            setIsLoading(true);
            try {
                // Ensure id doesn't contain query params if caught incorrectly by Next.js
                const cleanId = id.split('?')[0];
                const res = await api.get(`/listings/public/${cleanId}`);
                if (res.data?.status === 'success') {
                    setListing(res.data.data);
                } else {
                    setErrorMsg(`Status not success: ${JSON.stringify(res.data)}`);
                }
            } catch (err: any) {
                console.error('Error fetching listing details', err);
                setErrorMsg(`Axios Error: ${err.message}. URL: ${err.config?.baseURL}${err.config?.url}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleSendMessage = async () => {
        if (!message.trim() || !listing?.user?.id) return;
        setIsSending(true);
        
        try {
            const res = await api.post('/message/send', {
                host_id: listing.user.id,
                listing_id: listing.id,
                message: message.trim()
            });
            
            if (res.data?.status === 'success') {
                router.push(`/messages?conversation_id=${res.data.data.conversation_id}`);
            }
        } catch (err: any) {
            console.error('Error sending message', err);
            setErrorMsg(err.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white font-sans flex flex-col">
                <Header isCompact={true} hideSearch={true} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-white font-sans flex flex-col">
                <Header isCompact={true} hideSearch={true} />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <h1 className="text-2xl font-bold">Listing not found</h1>
                    {errorMsg && <p className="text-red-500 max-w-lg text-center break-words px-4">{errorMsg}</p>}
                </div>
            </div>
        );
    }

    const hostName = listing.user?.name || 'Host';
    const hostAvatar = listing.user?.avatar ? getStorageUrl(listing.user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostName}`;
    const listingImage = listing.photo_urls && listing.photo_urls.length > 0 ? getStorageUrl(listing.photo_urls[0].original) : '';

    return (
        <div className="min-h-screen bg-white font-sans pb-24 text-neutral-900">
            <Header isCompact={true} hideSearch={true} />
            
            <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-12 lg:gap-24 relative">
                
                {/* Left Column (Contact Form) */}
                <div className="flex-1 max-w-2xl">
                    <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors -ml-2 mb-6">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Contact {hostName}</h1>
                            <p className="text-neutral-500">Typically responds within an hour</p>
                        </div>
                        <img src={hostAvatar} alt={hostName} className="w-16 h-16 rounded-full object-cover shadow-sm bg-neutral-100 border border-neutral-200" />
                    </div>

                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-6 tracking-tight">Most travelers ask about</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Getting there</h3>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                                    <li>Free parking on the premises.</li>
                                    <li>Check-in time for this home starts at 3:00 PM and checkout is at 12:00 PM.</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">House details and rules</h3>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                                    <li>No smoking. No parties or events. No pets.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Price and availability</h3>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                                    <li>10% weekly price discount has been applied.</li>
                                    <li>Cancel up to 24 hours before check-in and get a full refund. After that, cancel before check-in and get a full refund, minus the first night and service fee.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4 tracking-tight">Still have questions? Message the host</h2>
                        <textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                setErrorMsg(''); // clear error when typing
                            }}
                            placeholder={`Hi ${hostName}! I'll be visiting...`}
                            className={`w-full h-40 p-4 bg-white text-neutral-900 border ${errorMsg ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-400 focus:border-neutral-900 focus:ring-neutral-900'} rounded-lg focus:ring-1 outline-none transition-all resize-none text-base`}
                        ></textarea>
                        
                        {errorMsg && (
                            <div className="mt-2 text-sm text-red-500 font-medium">
                                {errorMsg}
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <button 
                                onClick={handleSendMessage}
                                disabled={isSending || !message.trim()}
                                className="px-8 py-3.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? 'Sending...' : 'Send message'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (Booking Card) */}
                <div className="hidden md:block w-80 lg:w-[400px] flex-shrink-0 relative">
                    <div className="sticky top-28 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl">
                        
                        {/* Listing Info */}
                        <div className="flex gap-4 items-start mb-6">
                            <div className="flex-1">
                                {listing.price ? (
                                    <>
                                        <div className="text-[22px] font-bold text-neutral-900 leading-tight">
                                            {formatConverted(listing.price, listing.currency)} <span className="font-normal text-base text-neutral-500">for {Math.max(1, differenceInDays(new Date(checkOutStr), new Date(checkInStr)))} nights</span>
                                        </div>
                                        <div className="text-sm text-neutral-700 mt-1 line-clamp-1">{listing.title}</div>
                                        <div className="text-sm text-neutral-500">{listing.property_type || 'Entire rental unit'}</div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-neutral-900 line-clamp-3 leading-snug mb-1">{listing.title}</h3>
                                        <p className="text-xs text-neutral-500">{listing.property_type || 'Entire rental unit'}</p>
                                    </>
                                )}
                            </div>
                            {listingImage && (
                                <img src={listingImage} alt={listing.title} className="w-24 h-20 rounded-xl object-cover bg-neutral-100 flex-shrink-0 border border-neutral-200" />
                            )}
                        </div>

                        {/* Booking Widget Style Selection */}
                        <div ref={bookingWidgetRef} className="border border-neutral-300 rounded-xl mb-4 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
                            <div className={`relative ${isDatePickerOpen ? 'z-50' : 'z-10'}`}>
                                <div className="grid grid-cols-2 border-b border-neutral-300">
                                    <div 
                                        className="relative p-3 border-r border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer rounded-tl-xl"
                                        onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsGuestPickerOpen(false); }}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900">Check-in</div>
                                        <div className="text-sm text-neutral-700 mt-0.5">{format(new Date(checkInStr), 'MM/dd/yyyy')}</div>
                                    </div>
                                    <div 
                                        className="relative p-3 hover:bg-neutral-50 transition-colors cursor-pointer rounded-tr-xl"
                                        onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsGuestPickerOpen(false); }}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900">Checkout</div>
                                        <div className="text-sm text-neutral-700 mt-0.5">{format(new Date(checkOutStr), 'MM/dd/yyyy')}</div>
                                    </div>
                                </div>
                                
                                {/* Date Picker Popover */}
                                {isDatePickerOpen && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200 min-w-[660px]">
                                        <DateRange
                                            ranges={[{ startDate: new Date(checkInStr), endDate: new Date(checkOutStr), key: 'selection' }]}
                                            onChange={(item: any) => {
                                                if (item.selection.startDate) setCheckInStr(format(item.selection.startDate, 'yyyy-MM-dd'));
                                                if (item.selection.endDate) setCheckOutStr(format(item.selection.endDate, 'yyyy-MM-dd'));
                                            }}
                                            months={2}
                                            direction="horizontal"
                                            showDateDisplay={false}
                                            minDate={new Date()}
                                            rangeColors={['#262626']}
                                            className="w-full !font-sans"
                                        />
                                        <div className="flex justify-between mt-4">
                                            <button className="underline font-bold text-sm" onClick={() => {
                                                setCheckInStr(format(new Date(), 'yyyy-MM-dd'));
                                                setCheckOutStr(format(addDays(new Date(), 5), 'yyyy-MM-dd'));
                                            }}>Clear dates</button>
                                            <button onClick={() => setIsDatePickerOpen(false)} className="bg-neutral-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Close</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={`relative ${isGuestPickerOpen ? 'z-50' : 'z-10'}`}>
                                <div 
                                    className="p-3 hover:bg-neutral-50 transition-colors flex justify-between items-center cursor-pointer rounded-b-xl"
                                    onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
                                >
                                    <div className="w-full">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 pointer-events-none">Guests</div>
                                        <div className="text-sm mt-0.5 text-neutral-900 select-none">
                                            {totalGuests} guest{totalGuests !== 1 ? 's' : ''}{infants > 0 ? `, ${infants} infant${infants !== 1 ? 's' : ''}` : ''}{pets > 0 ? `, ${pets} pet${pets !== 1 ? 's' : ''}` : ''}
                                        </div>
                                    </div>
                                    <div>
                                        {isGuestPickerOpen ? <ChevronLeft size={20} className="rotate-90" /> : <ChevronRight size={20} className="rotate-90" />}
                                    </div>
                                </div>
                                
                                {/* Guest Selector Popover */}
                                {isGuestPickerOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center py-4 border-b border-neutral-200">
                                            <div>
                                                <div className="font-semibold text-neutral-900">Adults</div>
                                                <div className="text-sm text-neutral-500">Age 13+</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)); }} disabled={adults <= 1} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">-</button>
                                                <span className="w-4 text-center font-medium">{adults}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setAdults(Math.min((listing.guests_count || 10) - childrenCount, adults + 1)); }} disabled={totalGuests >= (listing.guests_count || 10)} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">+</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-b border-neutral-200">
                                            <div>
                                                <div className="font-semibold text-neutral-900">Children</div>
                                                <div className="text-sm text-neutral-500">Ages 2–12</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); setChildrenCount(Math.max(0, childrenCount - 1)); }} disabled={childrenCount <= 0} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">-</button>
                                                <span className="w-4 text-center font-medium">{childrenCount}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setChildrenCount(Math.min((listing.guests_count || 10) - adults, childrenCount + 1)); }} disabled={totalGuests >= (listing.guests_count || 10)} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">+</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-4">
                                            <div>
                                                <div className="font-semibold text-neutral-900">Infants</div>
                                                <div className="text-sm text-neutral-500">Under 2</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)); }} disabled={infants <= 0} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">-</button>
                                                <span className="w-4 text-center font-medium">{infants}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setInfants(infants + 1); }} className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 disabled:opacity-30 hover:border-neutral-800 transition-colors">+</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button onClick={() => setIsGuestPickerOpen(false)} className="font-bold underline text-neutral-900 hover:text-neutral-600 transition-colors">Close</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => router.back()} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white font-bold rounded-lg transition-all text-lg shadow-md mb-4">
                            Reserve
                        </button>
                        
                        <div className="text-center text-sm text-neutral-500 mb-6">
                            You won't be charged yet
                        </div>

                        {listing.price && (
                            <div className="space-y-4">
                                <div className="flex justify-between text-neutral-700 text-base">
                                    <span className="underline decoration-neutral-300">{formatConverted(listing.price, listing.currency)} x {Math.max(1, differenceInDays(new Date(checkOutStr), new Date(checkInStr)))} nights</span>
                                    <span>{formatConverted(listing.price * Math.max(1, differenceInDays(new Date(checkOutStr), new Date(checkInStr))), listing.currency)}</span>
                                </div>
                                <div className="flex justify-between text-[#008a05] font-medium text-base">
                                    <span>Weekly stay discount</span>
                                    <span>-{formatConverted(listing.price * Math.max(1, differenceInDays(new Date(checkOutStr), new Date(checkInStr))) * 0.10, listing.currency)}</span>
                                </div>
                                <div className="border-t border-neutral-200 pt-4 flex justify-between font-bold text-lg text-neutral-900">
                                    <span>Price after discount</span>
                                    <span>{formatConverted(listing.price * Math.max(1, differenceInDays(new Date(checkOutStr), new Date(checkInStr))) * 0.90, listing.currency)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
