'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const isDark = user?.ui_preferences?.dark_mode === true;

    useEffect(() => {
        const root = document.documentElement;
        
        const enforceTheme = () => {
            if (isDark) {
                if (!root.classList.contains('dark')) {
                    root.classList.add('dark');
                }
            } else {
                if (root.classList.contains('dark')) {
                    root.classList.remove('dark');
                }
                if (document.body.classList.contains('dark')) {
                    document.body.classList.remove('dark');
                }
            }
        };

        // Apply immediately
        enforceTheme();

        // Use MutationObserver to efficiently detect class changes from browser extensions
        const observer = new MutationObserver((mutations) => {
            let classChanged = false;
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    const currentlyDark = root.classList.contains('dark');
                    if ((isDark && !currentlyDark) || (!isDark && currentlyDark)) {
                        classChanged = true;
                        break;
                    }
                }
            }
            
            if (classChanged) {
                enforceTheme();
            }
        });
        
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, [isDark]);

    return <>{children}</>;
}
