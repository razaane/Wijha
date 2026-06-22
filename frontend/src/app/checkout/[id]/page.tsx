"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, CreditCard, Lock, Calendar, Users, MapPin, Star, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function SecureCheckoutPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    
    const listingId = params.id as string;
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Mock Card State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get(`/listings/${listingId}`);
                setListing(response.data.data);
            } catch (err) {
                console.error("Failed to load listing for checkout", err);
                setError("Failed to load listing details.");
            } finally {
                setLoading(false);
            }
        };

        if (listingId) fetchListing();
    }, [listingId]);

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 1;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const handleCheckout = async () => {
        if (!cardNumber || !expiry || !cvc) {
            setError('Please fill in all payment details.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Simulated Stripe network delay
            await new Promise(res => setTimeout(res, 2000));

            // Call the backend booking endpoint we updated
            await api.post('/bookings', {
                listing_id: listingId,
                check_in: checkIn,
                check_out: checkOut,
                guests_count: guests ? parseInt(guests) : 1
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/trips'); // Assuming this exists, or fallback to dashboard
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-amber-500" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Listing Not Found</h1>
                <Link href="/" className="text-amber-500 hover:underline">Return Home</Link>
            </div>
        );
    }

    const nights = calculateNights();
    const nightlyTotal = listing.price * nights;
    const serviceFee = Math.round(nightlyTotal * 0.10); // 10% fee
    const cleaningFee = listing.type === 'rental' ? 45 : 0; // Mock cleaning fee
    const grandTotal = nightlyTotal + serviceFee + cleaningFee;
    const currency = listing.currency || 'USD';

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center text-center p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                </motion.div>
                <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">Payment Successful!</h1>
                <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md">Your booking is confirmed and your money is securely held in Escrow. Redirecting to your trips...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans selection:bg-amber-200 dark:selection:bg-amber-500/30">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 sm:px-8 sticky top-0 z-50">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <ChevronLeft size={20} className="text-neutral-900 dark:text-white" />
                </button>
                <span className="ml-4 font-bold text-xl text-neutral-900 dark:text-white">Secure Checkout</span>
            </header>

            <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left Column: Payment & Details */}
                    <div className="lg:col-span-7 space-y-10">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 font-medium">
                                {error}
                            </div>
                        )}

                        <section className="space-y-6">
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Your trip</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
                                    <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold mb-1">
                                        <Calendar size={18} className="text-amber-500" /> Dates
                                    </div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {checkIn ? `${checkIn} - ${checkOut}` : 'Open Date'}
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
                                    <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold mb-1">
                                        <Users size={18} className="text-amber-500" /> Guests
                                    </div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {guests || 1} guest{parseInt(guests || '1') > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-neutral-200 dark:border-neutral-800" />

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Pay with card</h2>
                                <div className="flex gap-2">
                                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold italic">VISA</div>
                                    <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-[10px] font-bold relative overflow-hidden">
                                        <div className="absolute w-4 h-4 bg-yellow-400 rounded-full left-1 opacity-80"></div>
                                        <div className="absolute w-4 h-4 bg-red-600 rounded-full right-1 opacity-80"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Card Number</label>
                                    <div className="relative">
                                        <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:border-amber-500 outline-none transition-colors font-bold text-neutral-900 dark:text-white tracking-widest placeholder-neutral-300 dark:placeholder-neutral-600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Expiration</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:border-amber-500 outline-none transition-colors font-bold text-neutral-900 dark:text-white text-center tracking-widest placeholder-neutral-300 dark:placeholder-neutral-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">CVC</label>
                                        <input 
                                            type="text" 
                                            placeholder="123"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            maxLength={4}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:border-amber-500 outline-none transition-colors font-bold text-neutral-900 dark:text-white text-center tracking-widest placeholder-neutral-300 dark:placeholder-neutral-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                <Lock size={14} /> Payments are secure and encrypted.
                            </p>
                        </section>

                        <button 
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full py-5 rounded-2xl bg-amber-500 text-white font-black text-xl tracking-tight hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:shadow-none"
                        >
                            {isProcessing ? (
                                <><Loader2 size={24} className="animate-spin" /> Processing...</>
                            ) : (
                                `Confirm and pay ${currency} ${grandTotal.toLocaleString()}`
                            )}
                        </button>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-28 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                            
                            {/* Listing Snippet */}
                            <div className="flex gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-700">
                                <div className="w-28 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-2xl overflow-hidden shrink-0">
                                    {listing.photos && listing.photos.length > 0 ? (
                                        <img src={listing.photos[0].original_url} alt="Listing" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                                            <MapPin size={24} className="text-neutral-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">{listing.type}</span>
                                    <h3 className="text-neutral-900 dark:text-white font-bold leading-tight line-clamp-2">{listing.title}</h3>
                                    <div className="flex items-center gap-1 text-sm font-medium mt-1">
                                        <Star size={14} className="text-amber-500 fill-amber-500" />
                                        <span className="text-neutral-900 dark:text-white">4.92</span>
                                        <span className="text-neutral-400">(128 reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="py-6 border-b border-neutral-100 dark:border-neutral-700">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                                    <ShieldCheck size={24} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 dark:text-amber-500">Wijha Buyer Protection</h4>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 leading-snug">
                                            Your money is held securely in Escrow. The host is not paid until after you {listing.type === 'rental' ? 'check-in' : 'attend'}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="pt-6 space-y-4">
                                <h3 className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">Price details</h3>
                                
                                <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                                    <span>{currency} {listing.price} x {nights} night{nights > 1 ? 's' : ''}</span>
                                    <span>{currency} {nightlyTotal.toLocaleString()}</span>
                                </div>
                                
                                {cleaningFee > 0 && (
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                                        <span>Cleaning fee</span>
                                        <span>{currency} {cleaningFee}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                                    <span className="underline decoration-dashed underline-offset-4 cursor-help">Wijha service fee</span>
                                    <span>{currency} {serviceFee.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between text-neutral-900 dark:text-white font-black text-xl pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                    <span>Total ({currency})</span>
                                    <span>{currency} {grandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
