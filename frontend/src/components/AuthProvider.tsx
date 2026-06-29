"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useMessageStore } from '@/store/message.store';
import Cookies from 'js-cookie';
import echoInstance from '@/lib/echo';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, fetchUser } = useAuthStore();
    const { fetchUnreadCount, incrementUnread } = useMessageStore();
    const [isHydrating, setIsHydrating] = useState(true);

    useEffect(() => {
        const hydrateSession = async () => {
            // If the user has an auth cookie but no user object in memory (e.g. on page refresh),
            // fetch their profile from the backend before rendering protected content.
            if (Cookies.get('is_logged_in') && !user) {
                await fetchUser();
            }
            setIsHydrating(false);
        };

        hydrateSession();
    }, [user, fetchUser]);

    // Global Message Listener for unread counts
    useEffect(() => {
        if (!user) return;

        // Fetch initial unread count
        fetchUnreadCount();

        // Subscribe to user's global notification channel
        const channel = echoInstance.private(`App.Models.User.${user.id}`);
        
        channel.listen('.Modules\\Message\\Events\\ConversationMessageSent', (e: any) => {
            // If it's a message from someone else, increment unread count globally
            if (e.message?.sender_id !== user.id) {
                incrementUnread();
            }
        });

        return () => {
            channel.stopListening('.Modules\\Message\\Events\\ConversationMessageSent');
            echoInstance.leave(`App.Models.User.${user.id}`);
        };
    }, [user, fetchUnreadCount, incrementUnread]);
    if (isHydrating) {
        // Render nothing or a tiny spinner while hydrating to prevent flash of blocked content
        return null;
    }

    return <>{children}</>;
}
