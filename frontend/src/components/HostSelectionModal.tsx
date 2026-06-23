"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, Calendar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HostSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HostSelectionModal({ isOpen, onClose }: HostSelectionModalProps) {
    const router = useRouter();

    const handleSelect = (path: string) => {
        onClose();
        router.push(`/host/onboarding?type=${path}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose}></div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                    >
                        <div className="p-8 pb-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">What are you creating?</h2>
                            <button onClick={onClose} className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full flex items-center justify-center hover:bg-neutral-200 hover:text-neutral-900 dark:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => handleSelect('stay')} className="p-6 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-900 hover:bg-neutral-50 dark:bg-neutral-900 transition-all flex flex-col items-start group text-left">
                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Host a Stay</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Rent out an apartment, riad, or room.</p>
                            </button>
                            <button onClick={() => handleSelect('experience')} className="p-6 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-900 hover:bg-neutral-50 dark:bg-neutral-900 transition-all flex flex-col items-start group text-left">
                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Compass size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Host an Experience</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Guide a tour, workshop, or class.</p>
                            </button>
                            <button onClick={() => handleSelect('event')} className="p-6 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-900 hover:bg-neutral-50 dark:bg-neutral-900 transition-all flex flex-col items-start group text-left">
                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Organize an Event</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage tickets for festivals or shows.</p>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
