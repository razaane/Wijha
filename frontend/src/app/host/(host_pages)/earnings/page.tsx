"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { DollarSign, ShieldCheck, Wallet, Loader2, ArrowRight, Clock, AlertCircle } from "lucide-react";

interface EarningsData {
    total_escrow: number;
    total_paid_out: number;
    available_to_withdraw: number;
    upcoming_payouts: any[];
}

export default function EarningsDashboard() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await api.get('/payment/earnings');
                setData(response.data.data);
            } catch (err) {
                console.error("Failed to load earnings", err);
                setError("Failed to load your financial data.");
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-amber-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Oops!</h2>
                <p className="text-neutral-500 dark:text-neutral-400">{error || "Something went wrong."}</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-2">Earnings</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">Track your payouts, escrow balances, and financial health.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Paid Out */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500">
                            <Wallet size={20} />
                        </div>
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Total Earned</h3>
                    </div>
                    <p className="text-4xl font-black text-neutral-900 dark:text-white">${data.total_paid_out.toLocaleString()}</p>
                </div>

                {/* Held in Escrow */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Held in Escrow</h3>
                    </div>
                    <p className="text-4xl font-black text-neutral-900 dark:text-white">${data.total_escrow.toLocaleString()}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-2 font-medium">Secured until check-in/event ends</p>
                </div>

                {/* Available to Withdraw */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Available to Withdraw</h3>
                        </div>
                    </div>
                    <p className="text-4xl font-black text-neutral-900 dark:text-white">${data.available_to_withdraw.toLocaleString()}</p>
                    <p className="text-sm text-neutral-400 mt-2">Auto-payouts are enabled</p>
                </div>

            </div>

            {/* Upcoming Payouts Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Upcoming Payouts</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Funds currently held in secure Escrow.</p>
                    </div>
                </div>

                {data.upcoming_payouts.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No upcoming payouts</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">When guests book your listings, their payments will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Listing</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Expected Release</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {data.upcoming_payouts.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 overflow-hidden shrink-0">
                                                    {payment.booking?.listing?.photos?.[0] ? (
                                                        <img src={payment.booking.listing.photos[0].original_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                                                            <ShieldCheck size={16} className="text-amber-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-neutral-900 dark:text-white max-w-[200px] truncate">
                                                    {payment.booking?.listing?.title || 'Unknown Listing'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                            #{payment.booking_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            {payment.release_date ? new Date(payment.release_date).toLocaleDateString() : 'Pending'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-neutral-900 dark:text-white">
                                                ${parseFloat(payment.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                                <ShieldCheck size={12} /> Escrow Hold
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
