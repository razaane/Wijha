"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { TrendingUp, Users, Home, Loader2, Star, Calendar, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface InsightsData {
    metrics: {
        total_listings: number;
        total_bookings: number;
        total_revenue: number;
        occupancy_rate: number;
    };
    revenue_chart: { name: string; revenue: number }[];
    top_listings: any[];
}

export default function HostInsights() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/host/insights');
                setData(response.data.data);
            } catch (err) {
                console.error("Failed to load insights", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="animate-spin text-amber-500" />
            </div>
        );
    }

    if (!data) return null;

    const maxRevenue = Math.max(...data.revenue_chart.map(d => d.revenue), 100); // Prevent divide by zero

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-2">Insights</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">Analyze your performance and grow your business.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-amber-500">
                        <TrendingUp size={20} />
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Total Revenue</h3>
                    </div>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white">${data.metrics.total_revenue.toLocaleString()}</p>
                </div>
                
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <Calendar size={20} />
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Total Bookings</h3>
                    </div>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white">{data.metrics.total_bookings}</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-green-500">
                        <Users size={20} />
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Occupancy Rate</h3>
                    </div>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white">{data.metrics.occupancy_rate}%</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-purple-500">
                        <Home size={20} />
                        <h3 className="font-bold text-neutral-600 dark:text-neutral-400">Active Listings</h3>
                    </div>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white">{data.metrics.total_listings}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">Revenue (Last 6 Months)</h2>
                    
                    <div className="flex-1 flex items-end gap-2 md:gap-4 h-[250px] relative">
                        {data.revenue_chart.map((point, index) => {
                            const heightPercentage = (point.revenue / maxRevenue) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg pointer-events-none whitespace-nowrap z-10">
                                        ${point.revenue.toLocaleString()}
                                    </div>
                                    
                                    {/* Bar */}
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-t-xl group-hover:bg-amber-400 dark:group-hover:bg-amber-500 transition-colors relative overflow-hidden"
                                    >
                                        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-500 to-transparent opacity-50"></div>
                                    </motion.div>
                                    
                                    {/* Label */}
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-4">{point.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Listings */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Top Performing</h2>
                    
                    {data.top_listings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <Star size={32} className="text-neutral-300 dark:text-neutral-700 mb-3" />
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Not enough data to rank listings yet.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            {data.top_listings.map((listing, i) => (
                                <div key={listing.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group">
                                    <div className="w-14 h-14 bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden shrink-0 relative">
                                        {listing.photo ? (
                                            <img src={listing.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Home size={20} className="text-neutral-400" />
                                            </div>
                                        )}
                                        <div className="absolute top-0 left-0 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-br-lg flex items-center justify-center text-[10px] font-black text-white">
                                            {i + 1}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm truncate group-hover:text-amber-500 transition-colors">{listing.title}</h4>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                            {listing.bookings_count} Bookings <ArrowUpRight size={12} />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
