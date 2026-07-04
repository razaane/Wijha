"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, CreditCard, Lock, Plane, Loader2, CheckCircle2, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function FlightCheckoutPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    
    const flightId = params.id as string;

    const [flight, setFlight] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Mock Card State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    // Auth guard
    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user, router]);

    useEffect(() => {
        const fetchFlight = async () => {
            try {
                const response = await api.get(`/transport/flights/${flightId}`);
                setFlight(response.data.data);
            } catch (err: any) {
                console.error("Failed to load flight for checkout", err);
                setError(err.response?.data?.message || "Failed to load flight details. It may have expired.");
            } finally {
                setLoading(false);
            }
        };

        if (user && flightId) {
            fetchFlight();
        }
    }, [flightId, user]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');
        
        // Simulating a real payment gateway (Stripe/Paypal) delay
        setTimeout(() => {
            setIsProcessing(false);
            setSuccess(true);
            
            // Redirect to trips page after a few seconds
            setTimeout(() => {
                router.push('/trips');
            }, 3000);
        }, 2000);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        );
    }

    if (error || !flight) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-black">
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-neutral-100 dark:border-neutral-800">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plane size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Flight Unavailable</h2>
                    <p className="text-neutral-500 mb-6">{error || 'This flight session has expired or does not exist.'}</p>
                    <Link href="/transport" className="inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold px-6 py-3 rounded-xl hover:opacity-90">
                        Search Flights Again
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-black p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-neutral-900 p-10 rounded-[3rem] max-w-md w-full text-center shadow-2xl border border-neutral-100 dark:border-neutral-800"
                >
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                    </motion.div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-3">Ticket Confirmed!</h2>
                    <p className="text-neutral-500 mb-8 font-medium">Your flight with {flight.airline} has been successfully booked. Have a great trip!</p>
                    <div className="animate-pulse flex items-center justify-center gap-2 text-sm text-neutral-400 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to your trips...
                    </div>
                </motion.div>
            </div>
        );
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <header className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/transport" className="flex items-center gap-2 text-neutral-900 dark:text-white hover:opacity-70 transition-opacity font-bold">
                        <ChevronLeft size={20} /> Back
                    </Link>
                    <div className="font-black text-xl tracking-tight text-neutral-900 dark:text-white">
                        Wijha <span className="text-amber-500">Checkout</span>
                    </div>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left side: Payment Form */}
                    <div className="flex-1 max-w-2xl">
                        <div className="mb-10">
                            <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-4">Complete your booking</h1>
                            <p className="text-neutral-500 text-lg">You're just one step away from confirming your flight.</p>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-8">
                            
                            {/* Traveler Info */}
                            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 shadow-sm border border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Traveler Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-neutral-500 mb-2">First Name</label>
                                        <input type="text" defaultValue={user.name.split(' ')[0]} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium" required />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-neutral-500 mb-2">Last Name</label>
                                        <input type="text" defaultValue={user.name.split(' ').slice(1).join(' ')} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-neutral-500 mb-2">Email Address</label>
                                        <input type="email" defaultValue={user.email} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium" required />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 shadow-sm border border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Payment Method</h3>
                                    <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                        <ShieldCheck size={16} /> Secure
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-neutral-500 mb-2">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                            <input 
                                                type="text" 
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                placeholder="0000 0000 0000 0000" 
                                                className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium font-mono"
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-neutral-500 mb-2">Expiry Date</label>
                                            <input 
                                                type="text" 
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                                placeholder="MM/YY" 
                                                className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium font-mono"
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-neutral-500 mb-2">CVC</label>
                                            <div className="relative">
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                                <input 
                                                    type="text" 
                                                    value={cvc}
                                                    onChange={(e) => setCvc(e.target.value)}
                                                    placeholder="123" 
                                                    className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-medium font-mono"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="w-full bg-amber-500 text-white font-black text-lg py-5 rounded-2xl hover:bg-amber-600 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin" size={24} /> Processing payment...</>
                                ) : (
                                    <>Pay {flight.price.currency} {flight.price.amount}</>
                                )}
                            </button>
                            <p className="text-center text-sm font-medium text-neutral-500 flex items-center justify-center gap-2">
                                <Lock size={14} /> Payments are secure and encrypted.
                            </p>
                        </form>
                    </div>

                    {/* Right side: Boarding Pass Summary */}
                    <div className="w-full lg:w-[400px]">
                        <div className="sticky top-28 bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 border border-neutral-100 dark:border-neutral-800 overflow-hidden relative">
                            
                            {/* Boarding Pass Cutouts */}
                            <div className="absolute -left-4 top-[55%] w-8 h-8 bg-neutral-50 dark:bg-[#0a0a0a] rounded-full border-r border-neutral-200 dark:border-neutral-800 z-10"></div>
                            <div className="absolute -right-4 top-[55%] w-8 h-8 bg-neutral-50 dark:bg-[#0a0a0a] rounded-full border-l border-neutral-200 dark:border-neutral-800 z-10"></div>
                            <div className="absolute left-4 right-4 top-[55%] h-px border-t-2 border-dashed border-neutral-200 dark:border-neutral-800 translate-y-4"></div>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-2 inline-block uppercase tracking-wider">
                                        Flight Ticket
                                    </span>
                                    <p className="font-bold text-neutral-500 text-sm mt-1">{flight.provider}</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 p-2 flex-shrink-0 flex items-center justify-center">
                                    <img src={flight.logo} alt={flight.airline} className="max-w-full max-h-full object-contain" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <div className="text-left">
                                    <h2 className="text-4xl font-black text-neutral-900 dark:text-white leading-none">{flight.departure.iataCode}</h2>
                                    <p className="text-sm font-semibold text-neutral-500 mt-1">{formatTime(flight.departure.time)}</p>
                                </div>
                                
                                <div className="flex-1 px-4 flex flex-col items-center relative">
                                    <Plane className="text-amber-500 mb-2 relative z-10" size={24} />
                                    <div className="w-full border-t-2 border-dashed border-amber-200 dark:border-amber-500/30 absolute top-3 -z-0"></div>
                                    <p className="text-xs font-bold text-neutral-400 mt-2 bg-white dark:bg-neutral-900 px-2 relative z-10">{flight.duration}</p>
                                </div>

                                <div className="text-right">
                                    <h2 className="text-4xl font-black text-neutral-900 dark:text-white leading-none">{flight.arrival.iataCode}</h2>
                                    <p className="text-sm font-semibold text-neutral-500 mt-1">{formatTime(flight.arrival.time)}</p>
                                </div>
                            </div>

                            <div className="bg-neutral-50 dark:bg-black rounded-2xl p-4 flex justify-between items-center mb-16">
                                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    <Calendar size={16} className="text-neutral-400" />
                                    {formatDate(flight.departure.time)}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    <Clock size={16} className="text-neutral-400" />
                                    {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                                </div>
                            </div>

                            <div className="pt-8">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Price Breakdown</h3>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                                        <span>Flight Fare ({flight.price.currency})</span>
                                        <span>{(flight.price.amount * 0.85).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400 font-medium">
                                        <span>Taxes & Fees</span>
                                        <span>{(flight.price.amount * 0.15).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-500">Total Price</p>
                                        <p className="text-xs text-neutral-400 font-medium">Includes all taxes and fees</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-neutral-500 mr-1">{flight.price.currency}</span>
                                        <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{flight.price.amount}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
