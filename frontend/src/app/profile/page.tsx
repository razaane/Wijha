"use client";

import { useAuthStore } from "@/store/auth.store";
import { ShieldCheck, Star, Award, Building, Calendar, ChevronLeft, Edit3, ArrowRight, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getStorageUrl } from "@/lib/url";
import { api } from "@/lib/api";
import { useState, useRef } from "react";

export default function PremiumPublicProfilePage() {
    const { user, fetchUser } = useAuthStore();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const creationYear = user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();
    const yearsOnPlatform = new Date().getFullYear() - creationYear;
    
    const yearsString = yearsOnPlatform > 0 
        ? `${yearsOnPlatform} Year${yearsOnPlatform > 1 ? 's' : ''}` 
        : 'New';

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchUser(); // refresh user data
        } catch (error) {
            console.error("Failed to upload avatar", error);
            setUploadError("Failed to update profile picture.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-sans pb-24 transition-colors duration-300">
            
            {/* Top Navigation */}
            <div className="absolute top-0 w-full z-10 px-6 sm:px-12 py-8 flex items-center justify-between pointer-events-none">
                <button onClick={() => router.back()} className="pointer-events-auto flex items-center gap-2 text-sm font-bold bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/50 dark:border-neutral-800/50">
                    <ChevronLeft size={18} />
                    Back
                </button>
                <Link href="/settings" className="pointer-events-auto flex items-center gap-2 text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-full shadow-lg shadow-neutral-900/20 dark:shadow-white/10 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95">
                    <Edit3 size={16} />
                    Edit Profile
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative h-[45vh] min-h-[350px] bg-neutral-900 overflow-hidden flex items-end justify-center pb-16 rounded-b-[3rem] shadow-2xl">
                {/* Decorative Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-amber-500/40 to-transparent rounded-full blur-[120px] mix-blend-overlay"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-amber-600/30 to-transparent rounded-full blur-[100px] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                </div>

                <div className="relative z-10 text-center px-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative inline-block mb-6"
                    >
                        {/* Avatar Halo */}
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl scale-150"></div>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="relative w-36 h-36 rounded-full bg-neutral-800 border-4 border-neutral-900 shadow-2xl flex items-center justify-center text-5xl font-black text-neutral-400 overflow-hidden z-10 group cursor-pointer hover:border-amber-500 transition-all"
                        >
                            {isUploading ? (
                                <Loader2 className="animate-spin text-amber-500" size={32} />
                            ) : user.avatar ? (
                                <>
                                    <img src={getStorageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white mb-1" size={24} />
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {user.name?.charAt(0).toUpperCase()}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white mb-1" size={24} />
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
                                    </div>
                                </>
                            )}
                        </button>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        
                        {uploadError && (
                            <div className="absolute -bottom-10 whitespace-nowrap bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                {uploadError}
                            </div>
                        )}

                        {user.is_verified_host && (
                            <div className="absolute bottom-1 right-1 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center border-4 border-neutral-900 shadow-xl z-20">
                                <ShieldCheck size={20} className="text-white fill-amber-500" />
                            </div>
                        )}
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
                    >
                        {user.name}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-amber-500 font-bold uppercase tracking-widest text-sm"
                    >
                        Wijha Host
                    </motion.p>
                </div>
            </div>

            {/* Main Content: Bento Box Layout */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl mx-auto px-6 -mt-8 relative z-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* About Card */}
                <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-neutral-100 dark:border-neutral-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">About {user.name?.split(' ')[0]}</h2>
                    </div>
                    <p className="text-neutral-500 text-lg leading-relaxed">
                        Welcome to my Wijha profile! I am passionate about providing exceptional hospitality and creating memorable experiences for all my guests. 
                    </p>
                    
                    <div className="mt-8 pt-8 border-t border-neutral-100 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Languages</p>
                            <p className="font-semibold text-neutral-800 dark:text-white">English, {user.preferred_language === 'fr' ? 'Français' : user.preferred_language === 'ar' ? 'العربية' : 'French'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Response Rate</p>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-500">100%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Verification Card */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-900/60 dark:to-neutral-800/60 dark:border dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                    
                    <h2 className="text-xl font-bold tracking-tight mb-8">Confirmed Info</h2>
                    
                    <div className="space-y-5 relative z-10">
                        {user.is_verified_host && (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <ShieldCheck className="text-emerald-400" size={20} />
                                </div>
                                <span className="font-semibold text-lg">Identity</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Mail className="text-white" size={20} />
                            </div>
                            <span className="font-semibold text-lg">Email</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Phone className="text-white" size={20} />
                                </div>
                                <span className="font-semibold text-lg">Phone</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Bento */}
                <motion.div variants={itemVariants} className="bg-amber-50 dark:bg-amber-500/10 rounded-3xl p-8 border border-amber-100 dark:border-amber-500/20 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Star className="text-amber-500 fill-amber-500" size={28} />
                    </div>
                    <p className="text-4xl font-black text-neutral-900 dark:text-white mb-1">0</p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Reviews</p>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-blue-50 dark:bg-blue-500/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-500/20 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building className="text-blue-500" size={28} />
                    </div>
                    <p className="text-4xl font-black text-neutral-900 dark:text-white mb-1">0</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">Listings</p>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-purple-50 dark:bg-purple-500/10 rounded-3xl p-8 border border-purple-100 dark:border-purple-500/20 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="text-purple-500" size={28} />
                    </div>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white mb-1">{yearsString}</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-500 uppercase tracking-widest">On Wijha</p>
                </motion.div>
                
                {/* Reviews Section */}
                <motion.div variants={itemVariants} className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-neutral-100 dark:border-neutral-800 mt-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-8">Guest Reviews</h2>
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 flex flex-col items-center justify-center text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center mb-4">
                            <Star className="text-neutral-300 dark:text-neutral-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No reviews yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">When guests stay at your listings and leave reviews, they will appear here on your public profile.</p>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}

// Ensure Mail and Phone icons are imported
import { Mail, Phone } from "lucide-react";
