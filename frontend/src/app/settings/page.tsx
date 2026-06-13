"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Globe, Lock, Mail, Phone, ChevronLeft, X, Loader2, Edit3, CheckCircle2, Bell, Palette, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PremiumHostSettingsPage() {
    const { user, fetchUser } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('personal');
    
    // UI State
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'name' | 'email' | 'phone' | 'password' | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [language, setLanguage] = useState('en');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // OTP State
    // Mock States for new UI panels
    const [darkMode, setDarkMode] = useState(false);
    const [compactDensity, setCompactDensity] = useState(false);
    
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [promoEmails, setPromoEmails] = useState(false);

    const [profileVisible, setProfileVisible] = useState(true);
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [shareData, setShareData] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setCurrency(user.preferred_currency || 'USD');
            setLanguage(user.preferred_language || 'en');

            if (user.ui_preferences) {
                setDarkMode(user.ui_preferences.dark_mode ?? false);
                setCompactDensity(user.ui_preferences.compact_density ?? false);
            }
            if (user.notification_preferences) {
                setEmailAlerts(user.notification_preferences.email_alerts ?? true);
                setSmsAlerts(user.notification_preferences.sms_alerts ?? true);
                setPromoEmails(user.notification_preferences.promo_emails ?? false);
            }
            if (user.privacy_preferences) {
                setProfileVisible(user.privacy_preferences.profile_visible ?? true);
                setShowOnlineStatus(user.privacy_preferences.show_online_status ?? true);
                setShareData(user.privacy_preferences.share_data ?? false);
            }
        }
    }, [user, isModalOpen]);

    const openModal = (type: 'name' | 'email' | 'phone' | 'password') => {
        setModalType(type);
        setIsModalOpen(true);
        setOtpSent(false);
        setOtp('');
        setErrorMsg('');
        setSuccessMsg('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setModalType(null), 200);
    };

    const handleSaveName = async () => {
        setIsSaving(true);
        setErrorMsg('');
        try {
            await api.put('/auth/profile', { name, preferred_currency: currency, preferred_language: language });
            fetchUser();
            closeModal();
            setSuccessMsg('Name updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to update name.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async (newLang: string, newCurr: string) => {
        setIsSaving(true);
        setErrorMsg('');
        try {
            await api.put('/auth/profile', { name: user?.name, preferred_currency: newCurr, preferred_language: newLang });
            fetchUser();
            setSuccessMsg('Preferences updated successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to update preferences.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUI = async (key: 'dark_mode' | 'compact_density', value: boolean) => {
        if (key === 'dark_mode') setDarkMode(value);
        if (key === 'compact_density') setCompactDensity(value);
        
        try {
            await api.put('/auth/profile', { 
                name: user?.name,
                ui_preferences: { ...user?.ui_preferences, [key]: value }
            });
            fetchUser();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateNotifications = async (key: 'email_alerts' | 'sms_alerts' | 'promo_emails', value: boolean) => {
        if (key === 'email_alerts') setEmailAlerts(value);
        if (key === 'sms_alerts') setSmsAlerts(value);
        if (key === 'promo_emails') setPromoEmails(value);

        try {
            await api.put('/auth/profile', { 
                name: user?.name,
                notification_preferences: { ...user?.notification_preferences, [key]: value }
            });
            fetchUser();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdatePrivacy = async (key: 'profile_visible' | 'show_online_status' | 'share_data', value: boolean) => {
        if (key === 'profile_visible') setProfileVisible(value);
        if (key === 'show_online_status') setShowOnlineStatus(value);
        if (key === 'share_data') setShareData(value);

        try {
            await api.put('/auth/profile', { 
                name: user?.name,
                privacy_preferences: { ...user?.privacy_preferences, [key]: value }
            });
            fetchUser();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendOtp = async () => {
        setIsSaving(true);
        setErrorMsg('');
        try {
            if (modalType === 'email') await api.post('/auth/profile/email/send-otp', { email });
            else if (modalType === 'phone') await api.post('/auth/profile/phone/send-otp', { phone });
            setOtpSent(true);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsSaving(true);
        setErrorMsg('');
        try {
            if (modalType === 'email') await api.post('/auth/profile/email/verify', { email, otp });
            else if (modalType === 'phone') await api.post('/auth/profile/phone/verify', { phone, otp });
            fetchUser();
            closeModal();
            setSuccessMsg(`${modalType === 'email' ? 'Email' : 'Phone'} updated successfully!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Invalid verification code.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMsg('New passwords do not match.');
            return;
        }
        setIsSaving(true);
        setErrorMsg('');
        try {
            await api.put('/auth/profile/password', { current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword });
            closeModal();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccessMsg('Password updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'security', label: 'Login & Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Sharing', icon: EyeOff },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'localization', label: 'Localization', icon: Globe }
    ];

    // Helper for rendering a standard settings toggle switch
    const renderToggle = (label: string, description: string, checked: boolean, onChange: () => void) => (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group hover:border-amber-200 dark:hover:border-amber-500/50 transition-colors cursor-pointer" onClick={onChange}>
            <div className="pr-8">
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{label}</p>
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>
            </div>
            <div className={`transition-colors flex items-center justify-center ${checked ? 'text-amber-500' : 'text-neutral-300'}`}>
                {checked ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-sans pb-24 relative transition-colors duration-300">
            
            {/* Top Navigation */}
            <div className="absolute top-0 w-full z-10 px-6 sm:px-12 py-8 flex items-center justify-between pointer-events-none">
                <button onClick={() => router.back()} className="pointer-events-auto flex items-center gap-2 text-sm font-bold bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/50 dark:border-neutral-800/50">
                    <ChevronLeft size={18} />
                    Back
                </button>
                <Link href="/profile" className="pointer-events-auto flex items-center gap-2 text-sm font-bold bg-neutral-900 text-white px-6 py-2.5 rounded-full shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95">
                    <User size={16} />
                    View Profile
                </Link>
            </div>

            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 pt-32 flex flex-col md:flex-row gap-12 relative z-20">
                
                {/* Floating Sidebar */}
                <div className="w-full md:w-72 shrink-0">
                    <h1 className="text-4xl font-black mb-8 tracking-tight text-neutral-900 dark:text-white">Settings</h1>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex flex-col gap-1 transition-colors">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 relative overflow-hidden group ${
                                        isActive ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? "text-white" : "text-neutral-400 group-hover:text-amber-500 transition-colors"} />
                                    <span className="font-bold">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 max-w-3xl">
                    <AnimatePresence mode="wait">
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl border border-emerald-100 flex items-center gap-3 font-semibold shadow-sm">
                                <CheckCircle2 size={20} />
                                {successMsg}
                            </motion.div>
                        )}

                        {activeTab === 'personal' && (
                            <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Personal Information</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Update your identity details and how we can reach you.</p>

                                {/* Cards */}
                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group hover:border-amber-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Legal Name</p>
                                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{user?.name || 'Not provided'}</p>
                                    </div>
                                    <button onClick={() => openModal('name')} className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-amber-50 group-hover:text-amber-600 dark:group-hover:bg-amber-500/10 transition-all">
                                        <Edit3 size={18} />
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group hover:border-amber-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{user?.email || 'Not provided'}</p>
                                    </div>
                                    <button onClick={() => openModal('email')} className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-amber-50 group-hover:text-amber-600 dark:group-hover:bg-amber-500/10 transition-all">
                                        <Edit3 size={18} />
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group hover:border-amber-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                                    </div>
                                    <button onClick={() => openModal('phone')} className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-amber-50 group-hover:text-amber-600 dark:group-hover:bg-amber-500/10 transition-all">
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Login & Security</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Manage your account security and authentication methods.</p>

                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group hover:border-amber-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                                            <Lock size={20} className="text-neutral-400 dark:text-neutral-500" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-neutral-900 dark:text-white">Password</p>
                                            <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Regularly update for security</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openModal('password')} className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-lg">
                                        Update
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'localization' && (
                            <motion.div key="localization" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Localization</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Customize your dashboard experience.</p>

                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 dark:border-neutral-800 space-y-8">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Preferred Currency</p>
                                        <select 
                                            value={currency} 
                                            onChange={(e) => {
                                                setCurrency(e.target.value);
                                                handleSavePreferences(language, e.target.value);
                                            }}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hover:border-amber-200 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 outline-none transition-colors appearance-none cursor-pointer text-lg font-bold text-neutral-900 dark:text-white"
                                        >
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="EUR">Euro (€)</option>
                                            <option value="MAD">Moroccan Dirham (MAD)</option>
                                            <option value="GBP">British Pound (£)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Dashboard Language</p>
                                        <select 
                                            value={language} 
                                            onChange={(e) => {
                                                setLanguage(e.target.value);
                                                handleSavePreferences(e.target.value, currency);
                                            }}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hover:border-amber-200 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 outline-none transition-colors appearance-none cursor-pointer text-lg font-bold text-neutral-900 dark:text-white"
                                        >
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Notifications</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Choose how and when we contact you.</p>
                                
                                {renderToggle('Email Alerts', 'Receive booking confirmations and important updates via email.', emailAlerts, () => handleUpdateNotifications('email_alerts', !emailAlerts))}
                                {renderToggle('SMS Alerts', 'Get instantly notified on your phone for new bookings.', smsAlerts, () => handleUpdateNotifications('sms_alerts', !smsAlerts))}
                                {renderToggle('Marketing & Promos', 'Receive insights, host tips, and promotional offers from Wijha.', promoEmails, () => handleUpdateNotifications('promo_emails', !promoEmails))}
                            </motion.div>
                        )}

                        {activeTab === 'privacy' && (
                            <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Privacy & Sharing</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Control what others see and how your data is used.</p>
                                
                                {renderToggle('Public Profile Visibility', 'Allow your host profile to appear in search engines and public directories.', profileVisible, () => handleUpdatePrivacy('profile_visible', !profileVisible))}
                                {renderToggle('Show Online Status', 'Let guests see when you are currently online and active.', showOnlineStatus, () => handleUpdatePrivacy('show_online_status', !showOnlineStatus))}
                                {renderToggle('Data Analytics Sharing', 'Help improve Wijha by sharing anonymous usage statistics.', shareData, () => handleUpdatePrivacy('share_data', !shareData))}
                            </motion.div>
                        )}

                        {activeTab === 'appearance' && (
                            <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tight mb-2">Appearance</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">Customize how Wijha looks on your device.</p>
                                
                                {renderToggle('Dark Mode', 'Switch to a darker theme to reduce eye strain in low-light environments.', darkMode, () => handleUpdateUI('dark_mode', !darkMode))}
                                {renderToggle('Compact UI', 'Reduce spacing between elements to fit more information on the screen.', compactDensity, () => handleUpdateUI('compact_density', !compactDensity))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4"
                        onClick={closeModal}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-8 py-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md relative z-10">
                                <h3 className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                                    {modalType === 'name' ? 'Edit Legal Name' : 
                                     modalType === 'email' ? 'Update Email' : 
                                     modalType === 'phone' ? 'Update Phone' : 
                                     'Update Password'}
                               </h3>
                                <button onClick={closeModal} className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-full flex items-center justify-center transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                {errorMsg && (
                                    <div className="mb-6 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 font-semibold">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Forms */}
                                {modalType === 'name' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">First & Last Name</label>
                                            <input 
                                                type="text" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)} 
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 hover:border-amber-200 focus:border-amber-500 focus:bg-white outline-none transition-colors text-lg font-bold"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSaveName} 
                                            disabled={isSaving}
                                            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {isSaving && <Loader2 size={20} className="animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                )}

                                {(modalType === 'email' || modalType === 'phone') && (
                                    <div className="space-y-6">
                                        {!otpSent ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">New {modalType === 'email' ? 'Email' : 'Phone'}</label>
                                                    <input 
                                                        type={modalType === 'email' ? 'email' : 'text'} 
                                                        value={modalType === 'email' ? email : phone} 
                                                        onChange={(e) => modalType === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)} 
                                                        className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 hover:border-amber-200 focus:border-amber-500 focus:bg-white outline-none transition-colors text-lg font-bold"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={handleSendOtp} 
                                                    disabled={isSaving || (modalType === 'email' ? !email : !phone)}
                                                    className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black hover:shadow-lg hover:shadow-neutral-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                                >
                                                    {isSaving && <Loader2 size={20} className="animate-spin" />}
                                                    Send Security Code
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2 text-center">Enter 6-Digit Code</label>
                                                    <input 
                                                        type="text" 
                                                        value={otp} 
                                                        onChange={(e) => setOtp(e.target.value)} 
                                                        maxLength={6}
                                                        className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:border-amber-500 focus:bg-white outline-none transition-colors tracking-[0.5em] text-center text-3xl font-black text-amber-500"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={handleVerifyOtp} 
                                                    disabled={isSaving || otp.length !== 6}
                                                    className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                                >
                                                    {isSaving && <Loader2 size={20} className="animate-spin" />}
                                                    Verify and Save
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {modalType === 'password' && (
                                    <div className="space-y-4">
                                        <div>
                                            <input 
                                                type="password" 
                                                placeholder="Current password"
                                                value={currentPassword} 
                                                onChange={(e) => setCurrentPassword(e.target.value)} 
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:border-amber-500 focus:bg-white outline-none transition-colors text-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="password" 
                                                placeholder="New password"
                                                value={newPassword} 
                                                onChange={(e) => setNewPassword(e.target.value)} 
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:border-amber-500 focus:bg-white outline-none transition-colors text-lg font-bold"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="password" 
                                                placeholder="Confirm new password"
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:border-amber-500 focus:bg-white outline-none transition-colors text-lg font-bold"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleUpdatePassword} 
                                            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                                            className="w-full mt-2 bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black hover:shadow-lg hover:shadow-neutral-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {isSaving && <Loader2 size={20} className="animate-spin" />}
                                            Update Password
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
