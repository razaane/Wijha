"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Send, Search, MessageSquare, Loader2, Calendar, MapPin, CheckCheck, User, ChevronLeft } from "lucide-react";
import { getStorageUrl } from "@/lib/url";
import { motion, AnimatePresence } from "framer-motion";
import echoInstance from "@/lib/echo";

interface Thread {
    booking_id: number;
    listing: { id: number; title: string; photo: string | null };
    other_person: { id: number; name: string; avatar: string | null };
    latest_message: string | null;
    latest_message_time: string | null;
    unread_count: number;
}

interface Message {
    id: number;
    sender_id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    sender: { id: number; name: string; avatar: string | null };
}

export default function Inbox() {
    const { user } = useAuthStore();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchThreads();
    }, []);

    useEffect(() => {
        if (activeThread) {
            fetchMessages(activeThread.booking_id);

            // WebSocket Subscription
            const channel = echoInstance.private(`booking.${activeThread.booking_id}`);
            channel.listen('MessageSent', (e: any) => {
                const newMsg = e.message;
                // Only append if it's not sent by me (I already appended it optimistically)
                if (newMsg.sender_id !== user?.id) {
                    setMessages(prev => [...prev, newMsg]);
                    scrollToBottom();
                }
            });

            return () => {
                channel.stopListening('MessageSent');
                echoInstance.leaveChannel(`private-booking.${activeThread.booking_id}`);
            };
        }
    }, [activeThread, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchThreads = async () => {
        try {
            const res = await api.get('/bookings/messages/threads');
            setThreads(res.data.data);
            if (res.data.data.length > 0 && !activeThread) {
                setActiveThread(res.data.data[0]);
            }
        } catch (err) {
            console.error("Failed to load threads", err);
        } finally {
            setLoadingThreads(false);
        }
    };

    const fetchMessages = async (bookingId: number) => {
        setLoadingMessages(true);
        try {
            const res = await api.get(`/bookings/${bookingId}/messages`);
            setMessages(res.data.data);
            
            // Clear unread count locally
            setThreads(prev => prev.map(t => 
                t.booking_id === bookingId ? { ...t, unread_count: 0 } : t
            ));
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeThread || sending) return;

        const content = newMessage.trim();
        setNewMessage("");
        setSending(true);

        try {
            const res = await api.post(`/bookings/${activeThread.booking_id}/messages`, { content });
            setMessages(prev => [...prev, res.data.data]);
            
            // Update thread latest message locally
            setThreads(prev => prev.map(t => 
                t.booking_id === activeThread.booking_id 
                    ? { ...t, latest_message: content, latest_message_time: new Date().toISOString() } 
                    : t
            ));
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    const getAvatar = (avatar: string | null, name: string) => {
        return avatar ? getStorageUrl(avatar) : `https://ui-avatars.com/api/?name=${name}&background=f59e0b&color=fff`;
    };

    if (loadingThreads) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-amber-500" /></div>;
    }

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex overflow-hidden">
            
            {/* Sidebar (Threads) */}
            <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/50 dark:bg-neutral-900">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-4">Inbox</h2>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input 
                            type="text" 
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                            <MessageSquare size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium">No messages yet.</p>
                        </div>
                    ) : (
                        threads.map(thread => (
                            <div 
                                key={thread.booking_id}
                                onClick={() => setActiveThread(thread)}
                                className={`p-4 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition-colors ${
                                    activeThread?.booking_id === thread.booking_id 
                                        ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500' 
                                        : 'hover:bg-white dark:hover:bg-neutral-800 border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="flex gap-3 items-center">
                                    <div className="relative">
                                        <img src={getAvatar(thread.other_person.avatar, thread.other_person.name)} className="w-12 h-12 rounded-full object-cover shadow-sm border border-neutral-200 dark:border-neutral-700" />
                                        {thread.unread_count > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                                {thread.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-bold text-neutral-900 dark:text-white truncate pr-2">{thread.other_person.name}</h4>
                                            <span className="text-[10px] font-medium text-neutral-400 shrink-0">
                                                {thread.latest_message_time ? new Date(thread.latest_message_time).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-amber-600 dark:text-amber-500 truncate mb-1">{thread.listing.title}</p>
                                        <p className={`text-sm truncate ${thread.unread_count > 0 ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                            {thread.latest_message || 'Start the conversation...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${activeThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-neutral-900`}>
                {!activeThread ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/30 dark:bg-neutral-900/50">
                        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <MessageSquare size={32} className="text-neutral-400" />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Your Inbox</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">Select a thread from the sidebar to view messages and coordinate with guests.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveThread(null)} className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <ChevronLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
                                </button>
                                <img src={getAvatar(activeThread.other_person.avatar, activeThread.other_person.name)} className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700" />
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">{activeThread.other_person.name}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Inquiry for: <span className="text-amber-600 dark:text-amber-500">{activeThread.listing.title}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8f9fa] dark:bg-[#0f0f0f]">
                            {loadingMessages ? (
                                <div className="h-full flex items-center justify-center"><Loader2 size={30} className="animate-spin text-amber-500" /></div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
                                        <User size={24} className="text-neutral-300 dark:text-neutral-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Start the conversation</h4>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Say hello to {activeThread.other_person.name.split(' ')[0]}!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, index) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={msg.id} 
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {!isMe && (
                                                        <img src={getAvatar(msg.sender.avatar, msg.sender.name)} className="w-8 h-8 rounded-full mb-1 shrink-0 shadow-sm" />
                                                    )}
                                                    <div className={`px-5 py-3.5 rounded-3xl shadow-sm ${
                                                        isMe 
                                                            ? 'bg-amber-500 text-white rounded-br-sm' 
                                                            : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-bl-sm'
                                                    }`}>
                                                        <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1.5 px-1">
                                                    <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        <CheckCheck size={14} className={msg.is_read ? 'text-blue-500' : 'text-neutral-300 dark:text-neutral-600'} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none rounded-full px-6 py-3.5 focus:ring-2 focus:ring-amber-500 outline-none text-neutral-900 dark:text-white transition-shadow"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-12 h-12 flex-shrink-0 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors shadow-sm"
                                >
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
