import { create } from 'zustand';
import { api } from '@/lib/api';

interface MessageState {
    unreadCount: number;
    fetchUnreadCount: () => Promise<void>;
    incrementUnread: () => void;
    decrementUnread: (count?: number) => void;
    setUnreadCount: (count: number) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    unreadCount: 0,
    
    fetchUnreadCount: async () => {
        try {
            const res = await api.get('/message/unread-count');
            if (res.data?.status === 'success') {
                set({ unreadCount: res.data.data.count });
            }
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    },
    
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    
    decrementUnread: (count = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - count) })),
    
    setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
