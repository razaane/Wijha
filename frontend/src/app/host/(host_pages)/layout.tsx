"use client";

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, User, Settings, LogOut, Menu, X, Home, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '@/lib/url';

export default function HostDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (user && !user.is_verified_host) {
            router.push('/host/verify-identity');
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getAvatarUrl = (avatar?: string | null) => {
        if (!avatar) return `https://ui-avatars.com/api/?name=${user?.name}&background=f59e0b&color=fff`;
        return getStorageUrl(avatar);
    };

    if (!mounted || !isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const hostNavLinks = [
        { name: 'Today', href: '/host/dashboard' },
        { name: 'Calendar', href: '/host/calendar' },
        { name: 'Listings', href: '/host/listings' },
        { name: 'Scanner', href: '/host/scanner' },
        { name: 'Inbox', href: '/host/inbox' },
        { name: 'Insights', href: '/host/insights' },
        { name: 'Earnings', href: '/host/earnings' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col font-sans text-neutral-900 dark:text-white transition-colors duration-300">
            {/* Desktop Navbar */}
            <header className="h-20 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-8 bg-white dark:bg-[#0a0a0a] sticky top-0 z-50 transition-colors">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/host/dashboard" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Compass className="text-amber-500" size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-amber-500 tracking-tight hidden lg:block">Wijha</span>
                    </Link>

                    {/* Desktop Host Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {hostNavLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                                        isActive 
                                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Profile & Action Buttons (Right) */}
                <div className="flex items-center gap-4">
                    
                    {/* Notifications (Desktop) */}
                    <button className="hidden md:flex p-2.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></span>
                    </button>
                    
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
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">Host Account</p>
                                    </div>
                                    
                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white">
                                        <User size={18} className="text-neutral-400 dark:text-neutral-500" /> My Profile
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white">
                                        <Settings size={18} className="text-neutral-400 dark:text-neutral-500" /> Settings
                                    </Link>
                                    
                                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>

                                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                                        <Compass size={18} className="text-amber-500" /> Switch to Traveling
                                    </Link>
                                    
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
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-neutral-100 overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            {hostNavLinks.map((link) => (
                                <Link 
                                    key={link.name}
                                    href={link.href} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl font-bold text-lg ${pathname === link.href ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                            
                            <Link href="/dashboard" className="px-4 py-3 rounded-xl font-bold text-lg text-amber-600 flex items-center gap-3">
                                <Compass size={20} /> Switch to Traveling
                            </Link>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 rounded-xl font-bold text-lg text-red-600 flex items-center gap-3"
                            >
                                <LogOut size={20} /> Log Out
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 w-full px-4 sm:px-8 xl:px-12 py-8">
                {children}
            </main>
        </div>
    );
}
