'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Image as ImageIcon, ChevronLeft, Check, CheckCheck, Smile, MessageSquare, Reply, X, Info } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/landing/Header';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import echoInstance from '@/lib/echo';
import { getStorageUrl } from '@/lib/url';
import { useAuthStore } from '@/store/auth.store';
import { useMessageStore } from '@/store/message.store';

interface MessagesClientProps {
    isHostMode?: boolean;
}

export default function MessagesClient({ isHostMode = false }: MessagesClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const initialConversationId = searchParams.get('conversation_id');
    const { user: authUser, isAuthenticated } = useAuthStore();
    const { decrementUnread } = useMessageStore();
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
    const [activeConversationData, setActiveConversationData] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileListVisible, setIsMobileListVisible] = useState(!initialConversationId);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [replyTo, setReplyTo] = useState<any | null>(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<string | number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auth guard — redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    // Sync activeId with URL changes
    useEffect(() => {
        const urlConvId = searchParams.get('conversation_id');
        setActiveId(urlConvId || null);
        if (!urlConvId) {
            setActiveConversationData(null);
            if (window.innerWidth < 768) {
                setIsMobileListVisible(true);
            }
        }
    }, [searchParams]);

    // Fetch conversations list (with auth guard)
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchConversations = async () => {
            try {
                const res = await api.get(`/message/conversations?role=${isHostMode ? 'host' : 'guest'}`);
                if (res.data?.status === 'success') {
                    setConversations(res.data.data);
                }
            } catch (err: any) {
                // If unauthorized, redirect to login
                if (err?.response?.status === 401) {
                    router.replace('/login');
                    return;
                }
                console.error("Failed to load conversations", err);
            }
        };
        fetchConversations();
    }, [router]);

    // Fetch active conversation messages
    useEffect(() => {
        if (!activeId) return;
        
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/message/conversations/${activeId}?role=${isHostMode ? 'host' : 'guest'}`);
                if (res.data?.status === 'success') {
                    const conv = res.data.data.conversation;
                    if (isHostMode && conv.host_id !== authUser?.id) {
                        router.replace(pathname);
                        setActiveId(null);
                        return;
                    }
                    if (!isHostMode && conv.guest_id !== authUser?.id) {
                        router.replace(pathname);
                        setActiveId(null);
                        return;
                    }
                    setActiveConversationData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load messages", err);
                router.replace(pathname);
                setActiveId(null);
            }
        };
        fetchMessages();

        setIsMobileListVisible(false);
    }, [activeId]);

    // Scroll to bottom when active conversation changes or new message is sent
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversationData?.messages]);

    // WebSocket subscription for active conversation
    useEffect(() => {
        if (!activeId) return;

        const channel = echoInstance.private(`conversation.${activeId}`);
        
        channel.listen('.Modules\\Message\\Events\\ConversationMessageSent', (e: any) => {
            const newMsg = e.message;
            if (newMsg.sender_id !== authUser?.id) {
                setActiveConversationData((prev: any) => {
                    if (!prev) return prev;
                    // Prevent duplicates
                    if (prev.messages.some((m: any) => m.id === newMsg.id)) return prev;
                    return {
                        ...prev,
                        messages: [...prev.messages, newMsg]
                    };
                });
                
                // Also update the sidebar preview
                setConversations((prev: any) => prev.map((c: any) => {
                    if (c.id == activeId) {
                        return {
                            ...c,
                            messages: [newMsg]
                        };
                    }
                    return c;
                }));

                // Auto-read the message since we are in the active conversation
                api.get(`/message/conversations/${activeId}`); // this marks it as read in the backend
            }
        });

        return () => {
            channel.stopListening('.Modules\\Message\\Events\\ConversationMessageSent');
            echoInstance.leave(`conversation.${activeId}`);
        };
    }, [activeId, authUser]);

    // WebSocket subscriptions for all conversations (for unread counts in sidebar)
    useEffect(() => {
        if (!conversations.length) return;

        const channels = conversations.map((conv: any) => {
            const channel = echoInstance.private(`conversation.${conv.id}`);
            channel.listen('.Modules\\Message\\Events\\ConversationMessageSent', (e: any) => {
                const newMsg = e.message;
                // If this is the active conversation, the other useEffect handles it
                if (conv.id == activeId) return;

                if (newMsg.sender_id !== authUser?.id) {
                    setConversations((prev: any) => prev.map((c: any) => {
                        if (c.id === conv.id) {
                            return { ...c, messages: [newMsg] };
                        }
                        return c;
                    }));
                }
            });
            return channel;
        });

        return () => {
            conversations.forEach((conv: any) => {
                echoInstance.leave(`conversation.${conv.id}`);
            });
        };
    }, [conversations, activeId, authUser]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || !activeId || !activeConversationData) return;

        const otherUserId = authUser?.id === activeConversationData.conversation.host_id 
            ? activeConversationData.conversation.guest_id 
            : activeConversationData.conversation.host_id;

        const msgText = newMessage.trim();
        const currentAttachment = attachment;
        const currentReplyTo = replyTo;
        
        setNewMessage('');
        setAttachment(null);
        setReplyTo(null);
        
        try {
            // Optimistic update
            const tempMsg = {
                id: `new_${Date.now()}`,
                sender_id: authUser?.id,
                text: msgText,
                attachment_url: currentAttachment ? URL.createObjectURL(currentAttachment) : null,
                reply_to: currentReplyTo,
                created_at: new Date().toISOString()
            };
            setActiveConversationData((prev: any) => ({
                ...prev,
                messages: [...prev.messages, tempMsg]
            }));

            const formData = new FormData();
            formData.append('conversation_id', activeConversationData.conversation.id);
            if (msgText) formData.append('message', msgText);
            if (currentAttachment) formData.append('attachment', currentAttachment);
            if (currentReplyTo) formData.append('reply_to_id', currentReplyTo.id);

            await api.post('/message/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Reload conversations to update sidebar latest message
            const res = await api.get(`/message/conversations?role=${isHostMode ? 'host' : 'guest'}`);
            if (res.data?.status === 'success') {
                setConversations(res.data.data);
            }
            if (activeId) {
                const activeRes = await api.get(`/message/conversations/${activeId}`);
                if (activeRes.data?.status === 'success') {
                    setActiveConversationData(activeRes.data.data);
                }
            }

        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleReact = async (msgId: number, emoji: string) => {
        try {
            await api.post(`/message/${msgId}/react`, { emoji });
            const res = await api.get(`/message/conversations?role=${isHostMode ? 'host' : 'guest'}`);
            if (res.data?.status === 'success') {
                setConversations(res.data.data);
            }
            if (activeId) {
                const activeRes = await api.get(`/message/conversations/${activeId}`);
                if (activeRes.data?.status === 'success') {
                    setActiveConversationData(activeRes.data.data);
                }
            }
        } catch(err) {
            console.error('Reaction failed', err);
        }
    };

    const getOtherUser = (conv: any) => {
        if (!authUser) return conv.host;
        return authUser.id === conv.host_id ? conv.guest : conv.host;
    };

    const filteredConversations = conversations.filter(c => {
        const otherUser = getOtherUser(c);
        return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               c.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const activeOtherUser = activeConversationData ? getOtherUser(activeConversationData.conversation) : null;

    return (
        <>
            {!isHostMode && <Header hideSearch={true} />}
            <div className={`flex w-full bg-white dark:bg-[#0a0a0a] overflow-hidden ${isHostMode ? 'h-[calc(100vh-80px)] border-t border-neutral-200 dark:border-neutral-800' : 'h-[calc(100vh-81px)]'}`}>
            
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
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-neutral-400">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={24} className="text-neutral-300 dark:text-neutral-600" />
                            </div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">No messages found</p>
                            <p className="text-xs">When you contact a host, your messages will appear here.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredConversations.map((conv) => {
                                const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
                            const isActive = activeId == conv.id;
                            const otherUser = getOtherUser(conv);
                            const avatarUrl = otherUser?.avatar ? getStorageUrl(otherUser.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.name || 'User'}`;
                            
                            return (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={conv.id}
                                    onClick={() => {
                                        setActiveId(conv.id.toString());
                                        if (isMobileListVisible) setIsMobileListVisible(false);
                                        router.push(`${pathname}?conversation_id=${conv.id}`);
                                        
                                        // Mark as read locally immediately for snappier UI
                                        setConversations(prev => prev.map(c => {
                                            if (c.id === conv.id && c.messages?.length > 0) {
                                                const lastMsg = c.messages[0];
                                                if (lastMsg.sender_id !== authUser?.id && !lastMsg.read_at) {
                                                    // This was an unread message, we are marking it as read
                                                    decrementUnread();
                                                }
                                                return {
                                                    ...c,
                                                    messages: [{ ...lastMsg, read_at: new Date().toISOString() }, ...c.messages.slice(1)]
                                                };
                                            }
                                            return c;
                                        }));
                                    }}
                                    className={`w-full flex items-start gap-4 p-3 rounded-2xl transition-all text-left mb-2 ${isActive ? 'bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700' : 'bg-white/50 hover:bg-neutral-100 dark:bg-neutral-800/20 dark:hover:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800'}`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={avatarUrl} alt={otherUser?.name} className="w-14 h-14 rounded-full object-cover border border-neutral-200 dark:border-neutral-700" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold truncate pr-2 text-neutral-900 dark:text-white`}>
                                                {otherUser?.name || 'User'}
                                            </h3>
                                            {lastMessage && (
                                                <span className="text-xs text-neutral-400 shrink-0 font-medium">
                                                    {format(new Date(lastMessage.created_at), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                        {lastMessage && (
                                            <div className="flex justify-between items-center gap-2">
                                                <p className={`text-sm truncate text-neutral-500 dark:text-neutral-400 ${lastMessage && lastMessage.sender_id !== authUser?.id && !lastMessage.read_at ? 'font-semibold text-neutral-900 dark:text-white' : ''}`}>
                                                    {lastMessage.sender_id === authUser?.id ? 'You: ' : ''}{lastMessage.text}
                                                </p>
                                                {lastMessage && lastMessage.sender_id !== authUser?.id && !lastMessage.read_at && (
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"></div>
                                                )}
                                            </div>
                                        )}
                                        {conv.listing && (
                                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 truncate">
                                                {conv.listing.title}
                                            </p>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] transition-transform duration-300 ${isMobileListVisible ? 'translate-x-full md:translate-x-0 hidden md:flex' : 'flex'}`}>
                
                {activeId && activeConversationData ? (
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
                                    <img src={activeOtherUser?.avatar ? getStorageUrl(activeOtherUser.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOtherUser?.name || 'User'}`} alt={activeOtherUser?.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-800" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white text-lg leading-tight">{activeOtherUser?.name || 'User'}</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className={`p-2 transition-colors rounded-full ${isSidebarVisible ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                                    <Info size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 hide-scrollbar relative">

                            {activeConversationData.messages.map((msg: any, idx: number) => {
                                const isMe = msg.sender_id === authUser?.id;
                                const showAvatar = !isMe && (idx === 0 || activeConversationData.messages[idx - 1].sender_id === authUser?.id);
                                
                                return (
                                    <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'ml-auto flex-row-reverse' : ''} group relative`}>
                                        
                                        {/* Hover Menu for Reply & React */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                                            <button onClick={() => setReplyTo(msg)} className="p-1.5 text-neutral-400 hover:text-amber-500 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-100 dark:border-neutral-700 transition-colors" title="Reply">
                                                <Reply size={14} />
                                            </button>
                                            <div className="relative">
                                                <button onClick={() => setEmojiPickerMsgId(emojiPickerMsgId === msg.id ? null : msg.id)} className="p-1.5 text-neutral-400 hover:text-amber-500 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-neutral-100 dark:border-neutral-700 transition-colors" title="React">
                                                    <Smile size={14} />
                                                </button>
                                                {emojiPickerMsgId === msg.id && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 bg-white dark:bg-neutral-800 p-1.5 rounded-full shadow-lg border border-neutral-100 dark:border-neutral-700 z-50">
                                                        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(e => (
                                                            <button key={e} onClick={() => { handleReact(msg.id, e); setEmojiPickerMsgId(null); }} className="hover:scale-125 transition-transform text-[18px] leading-none p-1">{e}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {!isMe && (
                                            <div className="w-8 shrink-0">
                                                {showAvatar && (
                                                    <img src={activeOtherUser?.avatar ? getStorageUrl(activeOtherUser.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOtherUser?.name || 'User'}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover mt-auto" />
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div 
                                                className={`rounded-2xl text-[15px] leading-relaxed shadow-sm flex flex-col
                                                ${!msg.text && msg.attachment_url ? 'bg-transparent p-0 shadow-none items-end' : (
                                                    isMe 
                                                        ? 'px-5 py-3 bg-amber-500 text-white rounded-br-sm' 
                                                        : 'px-5 py-3 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-800 rounded-bl-sm'
                                                )}`}
                                            >
                                                {msg.reply_to_id || msg.reply_to ? (
                                                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-2 w-full ${isMe ? 'bg-amber-600/40 border-white text-white' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300'}`}>
                                                        <div className="font-bold mb-1 opacity-80">Replying to message</div>
                                                        <div className="line-clamp-1">{msg.reply_to?.text || 'Attachment'}</div>
                                                    </div>
                                                ) : null}
                                                {msg.attachment_url && (
                                                    <img src={msg.attachment_url.startsWith('blob:') ? msg.attachment_url : getStorageUrl(msg.attachment_url)} alt="Attachment" className="max-w-[240px] rounded-xl cursor-pointer hover:opacity-90 object-cover" />
                                                )}
                                                {msg.text && (
                                                    <div className={msg.attachment_url ? "mt-2" : ""}>{msg.text}</div>
                                                )}
                                            </div>
                                            
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'} -mt-3 mr-2 ml-2 z-10`}>
                                                    {msg.reactions.map((r: any) => (
                                                        <span key={r.id} className="inline-flex items-center justify-center w-6 h-6 bg-white dark:bg-neutral-800 rounded-full text-[10px] shadow border border-neutral-100 dark:border-neutral-700">
                                                            {r.emoji}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <span className="text-[11px] text-neutral-400 font-medium">
                                                    {msg.created_at ? format(new Date(msg.created_at), 'h:mm a') : ''}
                                                </span>
                                                {isMe && (
                                                    msg.read_at 
                                                        ? <CheckCheck size={14} className="text-amber-500" />
                                                        : <Check size={14} className="text-neutral-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800 shrink-0 relative">
                            
                            {/* Reply & Attachment Previews */}
                            {(replyTo || attachment) && (
                                <div className="max-w-4xl mx-auto mb-3 flex flex-col gap-2">
                                    {replyTo && (
                                        <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl flex items-center justify-between border border-neutral-200 dark:border-neutral-700">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-amber-500 font-bold mb-1">Replying to {replyTo.sender?.name || 'Message'}</span>
                                                <span className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-1">{replyTo.text || 'Attachment'}</span>
                                            </div>
                                            <button onClick={() => setReplyTo(null)} className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    {attachment && (
                                        <div className="relative inline-block w-fit group">
                                            <img src={URL.createObjectURL(attachment)} alt="attachment" className="w-20 h-20 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700" />
                                            <button type="button" onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 transition-opacity shadow-sm">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-end gap-3 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all shadow-sm">
                                
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 ml-1 mb-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0">
                                    <ImageIcon size={20} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) setAttachment(e.target.files[0]) }} />
                                 
                                <textarea 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none focus:ring-0 text-neutral-900 dark:text-white py-2.5 px-3 text-[15px] placeholder-neutral-400"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e as any);
                                        }
                                    }}
                                />

                                <button 
                                    type="submit" 
                                    disabled={(!newMessage.trim() && !attachment)}
                                    className="p-3 mb-0.5 mr-0.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-all shrink-0 flex items-center justify-center shadow-md"
                                >
                                    <Send size={18} className="-ml-0.5" />
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

            {/* Context/Reservation Sidebar (Right) */}
            {activeConversationData?.conversation?.listing && isSidebarVisible && (
                <div className="hidden lg:flex w-80 shrink-0 flex-col bg-white dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
                    {/* Header */}
                    <div className="h-20 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6 shrink-0">
                        <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Reservation</h2>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col gap-6">
                        {/* Listing Image & Title */}
                        <div className="flex flex-col gap-4">
                            {activeConversationData.conversation.listing.photo_urls?.[0]?.original ? (
                                <img src={getStorageUrl(activeConversationData.conversation.listing.photo_urls[0].original)} alt="Listing" className="w-full aspect-[4/3] rounded-2xl object-cover bg-neutral-200 shadow-sm" />
                            ) : (
                                <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                                    <ImageIcon size={32} className="text-neutral-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-1 leading-tight">{activeConversationData.conversation.listing.title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Hosted by {activeConversationData.conversation.listing.user?.name || activeConversationData.conversation.host?.name || 'Unknown'}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Inquiry</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                This is a pre-booking inquiry. Discuss the details with the host before confirming.
                            </p>
                            <button 
                                onClick={() => router.push(`/browse/${activeConversationData.conversation.listing.id}`)}
                                className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                            >
                                View Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
