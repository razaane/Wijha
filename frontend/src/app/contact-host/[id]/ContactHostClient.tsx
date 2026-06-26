'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/landing/Header';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactHostClient({ id }: { id: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [listing, setListing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Read params from URL
    const checkInParam = searchParams.get('check_in');
    const checkOutParam = searchParams.get('check_out');
    const guestsParam = searchParams.get('guests') || searchParams.get('adults');
    const [errorMsg, setErrorMsg] = useState('');

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
        if (!message.trim()) return;
        setIsSending(true);
        // Simulate sending a message since there's no backend endpoint yet
        setTimeout(() => {
            setIsSending(false);
            alert("Message sent to host successfully!");
            router.push(`/browse/${id}`);
        }, 1000);
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
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Hi ${hostName}! I'll be visiting...`}
                            className="w-full h-40 p-4 border border-neutral-400 rounded-lg focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all resize-none text-base"
                        ></textarea>
                        
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
                <div className="hidden md:block w-80 lg:w-96 flex-shrink-0 relative">
                    <div className="sticky top-28 bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                        
                        {/* Listing Info */}
                        <div className="flex gap-4 items-start mb-6 border-b border-neutral-200 pb-6">
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-neutral-900 line-clamp-3 leading-snug mb-1">{listing.title}</h3>
                                <p className="text-xs text-neutral-500">{listing.property_type || 'Entire rental unit'}</p>
                            </div>
                            {listingImage && (
                                <img src={listingImage} alt={listing.title} className="w-16 h-12 md:w-20 md:h-16 rounded-lg object-cover bg-neutral-100 flex-shrink-0" />
                            )}
                        </div>

                        {/* Booking Widget Style Selection */}
                        <div className="border border-[#b0b0b0] rounded-xl overflow-hidden mb-6 group focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition-all">
                            <div className="grid grid-cols-2 border-b border-[#b0b0b0]">
                                <div className="p-3 border-r border-[#b0b0b0]">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900">Check-In</div>
                                    <div className="text-sm text-neutral-600 mt-0.5">{checkInParam ? format(new Date(checkInParam), 'M/d/yyyy') : 'Add date'}</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900">Checkout</div>
                                    <div className="text-sm text-neutral-600 mt-0.5">{checkOutParam ? format(new Date(checkOutParam), 'M/d/yyyy') : 'Add date'}</div>
                                </div>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900">Guests</div>
                                    <div className="text-sm text-neutral-600 mt-0.5">{guestsParam || 1} guest{(Number(guestsParam || 1)) > 1 ? 's' : ''}</div>
                                </div>
                                <ChevronLeft size={16} className="text-neutral-500 -rotate-90" />
                            </div>
                        </div>

                        <button onClick={() => router.back()} className="w-full py-3.5 bg-[#e51d53] hover:bg-[#d90b43] text-white font-bold rounded-lg transition-colors shadow-md">
                            Change dates
                        </button>
                        
                        <div className="text-center text-sm text-neutral-500 mt-4">
                            You won't be charged yet
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
