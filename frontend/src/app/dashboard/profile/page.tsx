"use client";

import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, Camera, Loader2, Save, Check, X, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getStorageUrl } from '@/lib/url';

export default function ProfilePage() {
    const { user, setAuth, token } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [originalPhone, setOriginalPhone] = useState('');
    const [locale, setLocale] = useState('en');
    
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Phone OTP States
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [phoneSuccess, setPhoneSuccess] = useState('');
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setOriginalPhone(user.phone || '');
            setLocale(user.locale || 'en');
        }
    }, [user]);

    if (!mounted || !user) return null;

    const getAvatarUrl = (avatar: string | null | undefined) => {
        if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff&size=200`;
        return getStorageUrl(avatar);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Note: Phone is no longer updated here, it has its own verification flow
            const res = await api.put('/auth/profile', { name, locale });
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
            if (token) setAuth(res.data.data.user, token); // Update global store
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to upload avatar.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSendPhoneOtp = async () => {
        if (!phone) return;
        setPhoneLoading(true);
        setPhoneError('');
        setPhoneSuccess('');
        try {
            await api.post('/auth/profile/phone/send-otp', { phone });
            setShowOtpModal(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setPhoneError(error.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;
        
        setOtpLoading(true);
        setPhoneError('');
        try {
            const res = await api.post('/auth/profile/phone/verify', { phone, otp: code });
            if (token) setAuth(res.data.data, token);
            setOriginalPhone(phone);
            setShowOtpModal(false);
            setOtp(['', '', '', '', '', '']); // reset otp
            setPhoneSuccess('Phone number verified and updated successfully!');
            setTimeout(() => setPhoneSuccess(''), 4000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string, errors?: { otp?: string[] } } } };
            setPhoneError(error.response?.data?.errors?.otp?.[0] || error.response?.data?.message || 'Invalid verification code.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const phoneChanged = phone !== originalPhone;

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full relative">
            
            {/* OTP Modal Overlay */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowOtpModal(false)}
                                className="absolute top-5 right-5 text-neutral-400 hover:bg-neutral-100 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Verify Phone Number</h3>
                                <p className="text-neutral-500 text-sm">
                                    We've sent a 6-digit verification code to <br />
                                    <span className="font-bold text-neutral-900">{phone}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="flex justify-center gap-2 mb-6">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={otpRefs[index]}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                {phoneError && (
                                    <div className="text-red-500 text-sm text-center mb-4 font-medium">
                                        {phoneError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={otpLoading || otp.join('').length < 6}
                                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-70"
                                >
                                    {otpLoading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Save'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


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
            {phoneSuccess && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm mb-8 flex items-center gap-2 font-medium"
                >
                    <Check size={18} /> {phoneSuccess}
                </motion.div>
            )}
            {phoneError && !showOtpModal && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-8 flex items-center font-medium"
                >
                    {phoneError}
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
                    className="md:col-span-2 space-y-8"
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

                            <div className="pt-4 flex items-center justify-between">
                                <div>
                                    <AnimatePresence>
                                        {success && (
                                            <motion.span 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-green-600 font-bold flex items-center gap-2 text-sm"
                                            >
                                                <Check size={18} /> Saved
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
                                    Save Details
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">Phone Number</h2>
                        
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Secure Mobile Number</label>
                                <PhoneInput
                                    international
                                    defaultCountry="MA"
                                    value={phone}
                                    onChange={(val) => setPhone(val as string)}
                                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 transition-all font-medium wijha-phone-input"
                                />
                            </div>

                            {phoneChanged && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-center justify-between bg-amber-50 p-4 rounded-xl border border-amber-100"
                                >
                                    <p className="text-amber-800 text-sm font-medium">Click verify to securely update your phone number.</p>
                                    <button 
                                        onClick={handleSendPhoneOtp}
                                        disabled={phoneLoading}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {phoneLoading && <Loader2 size={14} className="animate-spin" />}
                                        Verify Number
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
