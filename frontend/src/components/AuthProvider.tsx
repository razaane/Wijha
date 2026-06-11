"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import Cookies from 'js-cookie';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, fetchUser } = useAuthStore();
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

    if (isHydrating) {
        // Render nothing or a tiny spinner while hydrating to prevent flash of blocked content
        return null;
    }

    return <>{children}</>;
}
