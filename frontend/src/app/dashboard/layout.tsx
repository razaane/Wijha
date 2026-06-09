"use client";

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, LayoutDashboard, User, Settings, LogOut, Menu, X, Plane } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // If we have a token but no user object (e.g. after page refresh), fetch the user
        const fetchUser = async () => {
            const token = useAuthStore.getState().token;
            if (!user && token) {
                try {
                    const res = await api.get('/auth/me');
                    useAuthStore.getState().setAuth(res.data.data, token);
                } catch (err) {
                    useAuthStore.getState().logout();
                    router.push('/login');
                }
            }
        };

        fetchUser();
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            useAuthStore.getState().logout();
            router.push('/login');
        }
    };

    const navLinks = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/dashboard/profile', icon: User },
        { name: 'My Bookings', href: '/dashboard/bookings', icon: Plane },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    if (!mounted || !user) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const getAvatarUrl = (avatar: string | null) => {
        if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff`;
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:8000/storage/${avatar}`;
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col justify-between py-6">
            <div className="px-6">
                <Link href="/" className="flex items-center gap-3 group mb-10">
                    <Compass size={32} className="text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="text-2xl font-bold text-neutral-900 tracking-tight">Wijha</span>
                </Link>

                <nav className="space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                    isActive 
                                    ? 'bg-amber-50 text-amber-600' 
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'text-amber-500' : 'text-neutral-400'} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="px-6">
                <div className="flex items-center gap-4 px-4 py-3 bg-neutral-50 rounded-xl mb-4 border border-neutral-100">
                    <img 
                        src={getAvatarUrl(user.avatar)} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-500 truncate capitalize">{user.role}</p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-semibold"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 bg-white border-r border-neutral-200 fixed inset-y-0 z-50 shadow-sm">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Overlay */}
            <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-neutral-200 z-40 px-4 flex items-center justify-between shadow-sm">
                <Link href="/" className="flex items-center gap-2">
                    <Compass size={28} className="text-amber-500" />
                    <span className="text-xl font-bold text-neutral-900">Wijha</span>
                </Link>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden"
                        >
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-5 right-5 p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
