'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();

    useEffect(() => {
        // Run once on mount to check local storage before auth loads
        const root = document.documentElement;
        
        // Once user loads, sync the class based on their preference
        if (user?.ui_preferences) {
            if (user.ui_preferences.dark_mode) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [user?.ui_preferences?.dark_mode]);

    return <>{children}</>;
}
