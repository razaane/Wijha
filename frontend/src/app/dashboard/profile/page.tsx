"use client";

import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import { User, Phone, Globe, Camera, Loader2, Save, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ProfilePage() {
    const { user, setAuth, token } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [locale, setLocale] = useState('en');
    
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setLocale(user.locale || 'en');
        }
    }, [user]);

    if (!mounted || !user) return null;

    const getAvatarUrl = (avatar: string | null) => {
        if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff&size=200`;
        if (avatar.startsWith('http')) return avatar;
        return `http://localhost:8000/storage/${avatar}`;
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await api.put('/auth/profile', { name, phone, locale });
            if (token) setAuth(res.data.data, token); // Update global store
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure it's an image
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setAvatarLoading(true);
        setError('');
        
        try {
            const res = await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (token) setAuth(res.data.data.user, token); // Update global store with new avatar
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to upload avatar.');
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">
                    My Profile
                </h1>
                <p className="text-neutral-500 text-lg">Manage your personal information and preferences.</p>
            </motion.div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-8 flex items-center"
                >
                    {error}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Avatar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-1"
                >
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
                        <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img 
                                src={getAvatarUrl(user.avatar)} 
                                alt={user.name} 
                                className={`w-32 h-32 rounded-full object-cover shadow-md border-4 border-white transition-opacity ${avatarLoading ? 'opacity-50' : 'group-hover:opacity-80'}`}
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={28} className="text-white" />
                            </div>

                            {avatarLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={32} className="text-amber-500 animate-spin" />
                                </div>
                            )}
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />

                        <h3 className="text-xl font-bold text-neutral-900 mb-1">{user.name}</h3>
                        <p className="text-neutral-500 text-sm mb-4">{user.email}</p>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {user.role}
                        </span>
                    </div>
                </motion.div>

                {/* Right Column: Settings Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2"
                >
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">Personal Details</h2>
                        
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+212600000000"
                                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Language Preference</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-amber-500 transition-colors">
                                        <Globe size={18} />
                                    </div>
                                    <select
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="ar">العربية</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <div>
                                    <AnimatePresence>
                                        {success && (
                                            <motion.span 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-green-600 font-bold flex items-center gap-2 text-sm"
                                            >
                                                <Check size={18} /> Profile updated
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
