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

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                                <Plane size={32} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Book Flights</h2>
                            <p className="text-white/80 mb-6 line-clamp-2">
                                Discover fast and reliable flights connecting major cities globally and across the MENA region.
                            </p>
                            
                            <div className="flex items-center gap-2 text-amber-400 font-bold group-hover:text-amber-300 transition-colors">
                                Search Flights <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                                <BusFront size={32} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Intercity Buses</h2>
                            <p className="text-white/80 mb-6 line-clamp-2">
                                Travel comfortably between cities with premium coach operators like CTM and Supratours.
                            </p>
                            
                            <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:text-emerald-300 transition-colors">
                                Search Buses <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
