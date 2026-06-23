"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Activity, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminOverviewPage() {
    const [realStats, setRealStats] = useState({
        pending_kyc: 0,
        total_users: 0,
        active_listings: 0,
        monthly_revenue: '0 MAD'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                if (res.data?.data) {
                    setRealStats(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { title: 'Pending KYC', value: realStats.pending_kyc, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-100', link: '/admin/kyc' },
        { title: 'Total Users', value: realStats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', link: '/admin/users' },
        { title: 'Active Listings', value: realStats.active_listings, icon: Activity, color: 'text-green-500', bg: 'bg-green-100', link: '#' },
        { title: 'Monthly Revenue', value: realStats.monthly_revenue, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100', link: '#' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-xs mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-neutral-300" /> : stat.value}
                                </h3>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <Link href={stat.link} className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white flex items-center gap-1">
                                View Details →
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Recent Activity</h3>
                <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                    Activity feed coming soon...
                </div>
            </div>
        </div>
    );
}
