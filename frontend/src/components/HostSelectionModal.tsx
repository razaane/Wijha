"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map, Ticket, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';

interface HostSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HostSelectionModal({ isOpen, onClose }: HostSelectionModalProps) {
    const router = useRouter();

    const handleSelect = (path: string) => {
        onClose();
        if (path === 'stay') {
            router.push('/host/onboarding');
        } else {
            alert("This feature is coming soon! For now, try hosting a Stay.");
        }
    };

    const options = [
        {
            id: 'stay',
            title: 'Host a Stay',
            description: 'Earn money sharing your extra space, riad, or apartment with travelers.',
            icon: Home,
            color: 'text-amber-500',
            bg: 'bg-amber-500',
            image: '/images/host_stay.png'
        },
        {
            id: 'experience',
            title: 'Host an Experience',
            description: 'Lead local tours, cooking classes, or unique cultural adventures.',
            icon: Map,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
            image: '/images/host_experience.png'
        },
        {
            id: 'event',
            title: 'Organize an Event',
            description: 'Sell tickets for concerts, workshops, festivals, and exclusive gatherings.',
            icon: Ticket,
            color: 'text-blue-500',
            bg: 'bg-blue-500',
            image: '/images/host_event.png'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
                    {/* Light Blurred Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/60 backdrop-blur-xl"
                    />

                    {/* Modal Content - Bright Theme */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
                        className="relative w-full max-w-7xl h-[90vh] max-h-[850px] bg-white rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.1)] overflow-hidden border border-neutral-200 flex flex-col"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-3 bg-white/80 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-full transition-colors z-20 backdrop-blur-md border border-neutral-200 shadow-sm"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 sm:p-12 pb-6 text-center z-10 flex-shrink-0">
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 font-bold text-sm tracking-widest uppercase mb-4"
                            >
                                Join the Wijha Community
                            </motion.span>
                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight"
                            >
                                What would you like to host?
                            </motion.h2>
                        </div>

                        <div className="flex-1 p-8 sm:p-12 pt-0 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                                {options.map((option, idx) => (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1), type: "spring", stiffness: 100 }}
                                        onClick={() => handleSelect(option.id)}
                                        className="group relative rounded-[32px] overflow-hidden cursor-pointer h-full min-h-[400px] shadow-lg hover:shadow-2xl transition-all duration-500"
                                    >
                                        {/* Background Image */}
                                        <div className="absolute inset-0 w-full h-full">
                                            <Image 
                                                src={option.image} 
                                                alt={option.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                                        
                                        {/* Colored Glow on Hover */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${option.bg} mix-blend-overlay`} />

                                        {/* Content */}
                                        <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/30 text-white`}>
                                                    <option.icon size={28} />
                                                </div>
                                                
                                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
                                                    {option.title}
                                                </h3>
                                                
                                                <p className="text-white/80 text-base leading-relaxed mb-6 font-medium max-w-sm">
                                                    {option.description}
                                                </p>
                                                
                                                <div className="flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                    <span className="bg-white text-neutral-900 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                                                        Get started <ArrowRight size={16} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
