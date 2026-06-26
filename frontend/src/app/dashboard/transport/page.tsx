"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plane, BusFront, ArrowRight } from 'lucide-react';

export default function TransportHub() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">
                    Where will your journey take you?
                </h1>
                <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                    Book flights across the MENA region or find comfortable intercity buses to explore the hidden gems of the Maghreb.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Flights Card */}
                <Link href="/dashboard/transport/flights">
                    <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-96 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop" 
                            alt="Book Flights"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                                <Plane size={28} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Flights</h2>
                            <p className="text-white/95 mb-4 text-base font-medium line-clamp-2">
                                Discover fast and reliable flights across the MENA region.
                            </p>
                            
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:text-amber-300 transition-colors">
                                Search Flights <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Buses Card */}
                <Link href="/dashboard/transport/buses">
                    <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-96 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop" 
                            alt="Book Buses"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                                <BusFront size={28} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Buses</h2>
                            <p className="text-white/95 mb-4 text-base font-medium line-clamp-2">
                                Travel comfortably between cities with premium coach operators.
                            </p>
                            
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:text-amber-300 transition-colors">
                                Search Buses <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Trains Card */}
                <Link href="/dashboard/transport/trains">
                    <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-96 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200&auto=format&fit=crop" 
                            alt="Book Trains"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h0"/><path d="M16 15h0"/></svg>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Trains</h2>
                            <p className="text-white/95 mb-4 text-base font-medium line-clamp-2">
                                Fast and scenic railway journeys with ONCF TGV and Al Boraq.
                            </p>
                            
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:text-amber-300 transition-colors">
                                Search Trains <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
