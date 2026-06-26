'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, Image as ImageIcon, MoreVertical, ChevronLeft, Check, CheckCheck, Smile, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/landing/Header';

const MOCK_CONVERSATIONS: any[] = [];

export default function MessagesClient() {
    const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];

    // Scroll to bottom when active conversation changes or new message is sent
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    // Update mobile visibility when a conversation is selected
    useEffect(() => {
        if (activeId) {
            setIsMobileListVisible(false);
            
            // Mark as read
            setConversations(prev => prev.map(c => 
                c.id === activeId ? { ...c, unread: 0 } : c
            ));
        }
    }, [activeId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeId) return;

        const newMsgObj = {
            id: `new_${Date.now()}`,
            senderId: 'me',
            text: newMessage,
            timestamp: new Date()
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeId) {
                return {
                    ...c,
                    messages: [...c.messages, newMsgObj]
                };
            }
            return c;
        }));

        setNewMessage('');
    };

    const filteredConversations = conversations.filter(c => 
        c.host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Header hideSearch={true} />
            <div className="flex h-[calc(100vh-81px)] bg-white dark:bg-[#0a0a0a] overflow-hidden">
            
            {/* Sidebar (List) */}
            <div className={`w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 shrink-0 transition-transform duration-300 ${!isMobileListVisible ? '-translate-x-full md:translate-x-0 hidden md:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white mb-4">Messages</h1>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-neutral-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar p-2 md:p-3">
                    <AnimatePresence>
                        {filteredConversations.map((conv) => {
                            const lastMessage = conv.messages[conv.messages.length - 1];
                            const isActive = activeId === conv.id;
                            
                            return (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={conv.id}
                                    onClick={() => setActiveId(conv.id)}
                                    className={`w-full flex items-start gap-4 p-3 rounded-2xl transition-all text-left mb-1 ${isActive ? 'bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50 border border-transparent'}`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={conv.host.avatar} alt={conv.host.name} className="w-14 h-14 rounded-full object-cover border border-neutral-200 dark:border-neutral-700" />
                                        {conv.host.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold truncate pr-2 ${conv.unread > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-200'}`}>
                                                {conv.host.name}
                                            </h3>
                                            <span className="text-xs text-neutral-400 shrink-0 font-medium">
                                                {format(lastMessage.timestamp, 'MMM d')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                                {lastMessage.senderId === 'me' ? 'You: ' : ''}{lastMessage.text}
                                            </p>
                                            {conv.unread > 0 && (
                                                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                    {conv.unread}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 truncate">
                                            {conv.listing.title}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] transition-transform duration-300 ${isMobileListVisible ? 'translate-x-full md:translate-x-0 hidden md:flex' : 'flex'}`}>
                
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 md:px-8 shrink-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsMobileListVisible(true)}
                                    className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="relative">
                                    <img src={activeConversation.host.avatar} alt={activeConversation.host.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-800" />
                                    {activeConversation.host.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white text-lg leading-tight">{activeConversation.host.name}</h2>
                                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
                                        Host
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 hide-scrollbar relative">
                            {/* Context Card (Sticky-ish) */}
                            <div className="mx-auto w-full max-w-sm mb-4">
                                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                                    <img src={activeConversation.listing.image} alt="Listing" className="w-16 h-16 rounded-xl object-cover" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Inquiry</p>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2">{activeConversation.listing.title}</p>
                                    </div>
                                </div>
                            </div>

                            {activeConversation.messages.map((msg: any, idx: number) => {
                                const isMe = msg.senderId === 'me';
                                const showAvatar = !isMe && (idx === 0 || activeConversation.messages[idx - 1].senderId === 'me');
                                
                                return (
                                    <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                        
                                        {!isMe && (
                                            <div className="w-8 shrink-0">
                                                {showAvatar && (
                                                    <img src={activeConversation.host.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover mt-auto" />
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div 
                                                className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                                                ${isMe 
                                                    ? 'bg-amber-500 text-white rounded-br-sm' 
                                                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-800 rounded-bl-sm'
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <span className="text-[11px] text-neutral-400 font-medium">
                                                    {format(msg.timestamp, 'h:mm a')}
                                                </span>
                                                {isMe && <CheckCheck size={14} className="text-amber-500" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800 shrink-0">
                            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-3xl border border-neutral-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
                                
                                <button type="button" className="p-2.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors shrink-0">
                                    <Paperclip size={20} />
                                </button>
                                
                                <textarea 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none focus:ring-0 text-neutral-900 dark:text-white py-2.5 text-[15px] placeholder-neutral-400"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />

                                <button type="button" className="p-2.5 text-neutral-400 hover:text-amber-500 transition-colors shrink-0 hidden sm:block">
                                    <Smile size={20} />
                                </button>

                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 m-0.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-all shrink-0 flex items-center justify-center shadow-md"
                                >
                                    <Send size={18} className="ml-0.5" />
                                </button>

                            </form>
                            <p className="text-center text-[11px] text-neutral-400 mt-3 font-medium">
                                Protect yourself by communicating and paying only on the Wijha platform.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                        <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-lg font-medium text-neutral-900 dark:text-white">Your Messages</p>
                        <p className="text-sm">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
