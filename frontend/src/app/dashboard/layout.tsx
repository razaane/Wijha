"use client";

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, User, Settings, LogOut, Menu, X, Plane, ChevronDown, Home } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { getStorageUrl } from '@/lib/url';
import HostSelectionModal from '@/components/HostSelectionModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout, fetchUser } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isHostModalOpen, setIsHostModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        
        if (!isAuthenticated) {
            window.location.href = '/login';
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Check if user just finished onboarding and needs a role refresh
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('host') === 'true') {
                fetchUser().then(() => {
                    router.replace('/dashboard'); // Clean the URL
                });
            }
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAuthenticated, router, fetchUser]);

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
        { name: 'Stays', href: '/dashboard' },
        { name: 'Experiences', href: '/dashboard/experiences' },
        { name: 'My Bookings', href: '/dashboard/bookings' },
    ];

    if (!mounted || !isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const getAvatarUrl = (avatar: string | null | undefined) => {
        if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff`;
        return getStorageUrl(avatar);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-neutral-100 dark:border-neutral-800/50 shadow-sm transition-all">
                <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-24 flex items-center justify-between">
                    
                    {/* Logo (Left) */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <Compass size={36} className="text-amber-500 group-hover:rotate-45 transition-transform duration-500" />
                            <span className="text-3xl font-black text-amber-500 tracking-tight">Wijha</span>
                        </Link>
                    </div>

                    {/* Navigation Pills (Center - Desktop) */}
                    <nav className="hidden md:flex items-center space-x-1 p-1.5 bg-neutral-100/70 dark:bg-neutral-900/70 rounded-full border border-neutral-200 dark:border-neutral-800">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/50 dark:border-neutral-700' 
                                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Profile & Action Buttons (Right) */}
                    <div className="flex items-center gap-4">
                        
                        {/* Host Button (Desktop) */}
                        {user?.role !== 'partner' && (
                            user?.has_pending_verification ? (
                                <span className="hidden md:block px-5 py-2.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500 text-sm font-bold cursor-default">
                                    Verification Pending
                                </span>
                            ) : (
                                <button 
                                    onClick={() => setIsHostModalOpen(true)}
                                    className="hidden md:block px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors"
                                >
                                    Become a Host
                                </button>
                            )
                        )}
                        
                        {/* Profile Dropdown (Desktop) */}
                        <div className="hidden md:block relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 pl-3 pr-4 py-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md rounded-full transition-all"
                            >
                                <img 
                                    src={getAvatarUrl(user.avatar)} 
                                    alt={user.name} 
                                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-neutral-100 dark:border-neutral-800"
                                />
                                <div className="flex flex-col items-start hidden lg:flex">
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{user.name.split(' ')[0]}</span>
                                </div>
                                <Menu size={18} className="text-neutral-500 dark:text-neutral-400 ml-1" />
                            </button>

                            <AnimatePresence>
                                {isProfileDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden py-2"
                                    >
                                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                                        </div>
                                        
                                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white">
                                            <User size={18} className="text-neutral-400 dark:text-neutral-500" /> My Profile
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white">
                                            <Settings size={18} className="text-neutral-400 dark:text-neutral-500" /> Settings
                                        </Link>
                                        
                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>

                                        {user?.role === 'partner' ? (
                                            <Link href="/host/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                                                <Home size={18} className="text-amber-500" /> Switch to Hosting
                                            </Link>
                                        ) : user?.has_pending_verification ? (
                                            <div className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-500/5 cursor-default">
                                                <Home size={18} className="text-amber-500" /> Verification Pending
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setIsProfileDropdownOpen(false);
                                                    setIsHostModalOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                                            >
                                                <Home size={18} className="text-neutral-400 dark:text-neutral-500" /> Become a Host
                                            </button>
                                        )}
                                        
                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                            <LogOut size={18} /> Log Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 dark:bg-black/80 z-50 md:hidden backdrop-blur-sm"
                        />
                        <motion.aside 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-900 shadow-2xl z-50 md:hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">Menu</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <img 
                                        src={getAvatarUrl(user.avatar)} 
                                        alt={user.name} 
                                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                                    />
                                    <div>
                                        <p className="text-base font-bold text-neutral-900 dark:text-white">{user.name}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                    </div>
                                </div>

                                <nav className="space-y-2 mb-8">
                                    {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${
                                                    isActive ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                                }`}
                                            >
                                                {link.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                                
                                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-6"></div>

                                <nav className="space-y-2">
                                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                        <User size={20} /> My Profile
                                    </Link>
                                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                        <Settings size={20} /> Settings
                                    </Link>
                                    {user?.role !== 'partner' && (
                                        user?.has_pending_verification ? (
                                            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 cursor-default">
                                                <Home size={20} className="text-amber-500" /> Verification Pending
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    setIsHostModalOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            >
                                                <Home size={20} /> Become a Host
                                            </button>
                                        )
                                    )}
                                </nav>
                            </div>

                            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut size={20} /> Log Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main>
                {children}
            </main>

            {/* Host Selection Modal */}
            <HostSelectionModal 
                isOpen={isHostModalOpen} 
                onClose={() => setIsHostModalOpen(false)} 
            />
        </div>
    );
}
