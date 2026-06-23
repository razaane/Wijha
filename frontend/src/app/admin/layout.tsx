"use client";

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, LayoutDashboard, ShieldCheck, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/dashboard');
            } else {
                setIsChecking(false);
            }
        }
    }, [user, isLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isChecking) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
        { href: '/admin/kyc', icon: ShieldCheck, label: 'Identity Verification' },
        { href: '/admin/users', icon: Users, label: 'User Management' },
    ];

    return (
        <div className="min-h-screen bg-neutral-100 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-neutral-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <span className="text-amber-500">Wijha</span> Admin
                    </h1>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link 
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                    isActive 
                                    ? 'bg-amber-500/10 text-amber-500' 
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                                {isActive && (
                                    <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                            {navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-bold text-neutral-900">{user?.name}</span>
                            <span className="text-xs text-neutral-500 font-medium">Administrator</span>
                        </div>
                        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
