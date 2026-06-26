import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string | null;
    phone?: string | null;
    locale?: string;
    preferred_currency?: string;
    preferred_language?: string;
    notification_preferences?: {
        email_alerts: boolean;
        sms_alerts: boolean;
        promo_emails: boolean;
    };
    privacy_preferences?: {
        profile_visible: boolean;
        show_online_status: boolean;
        share_data: boolean;
    };
    ui_preferences?: {
        dark_mode: boolean;
        compact_density: boolean;
    };
    is_verified_host?: boolean;
    has_pending_verification?: boolean;
    created_at?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User, token: string) => void;
    fetchUser: () => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null, // Token is now securely stored in an HttpOnly cookie and managed by the backend
    isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('is_logged_in') : false,
    isLoading: true,

    setAuth: (user, token) => {
        // The token is now set automatically by the backend via HttpOnly cookies
        // We only keep the token parameter here for legacy compatibility in memory if needed
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    fetchUser: async () => {
        // Only fetch if we believe we are authenticated but have no user data
        if (typeof window !== 'undefined' && Cookies.get('is_logged_in')) {
            try {
                // Dynamically import api to avoid circular dependencies if any
                const { api } = await import('@/lib/api');
                const res = await api.get('/auth/me');
                if (res.data?.data) {
                    set({ user: res.data.data, isAuthenticated: true, isLoading: false });
                    
                    // Fetch favorite IDs
                    try {
                        const { getFavoriteIds } = await import('@/lib/favorites.api');
                        const { useFavoriteStore } = await import('@/store/favorite.store');
                        const favoriteIds = await getFavoriteIds();
                        useFavoriteStore.getState().setFavorites(favoriteIds);
                    } catch (e) {
                        console.error('Failed to fetch favorite ids', e);
                    }
                } else {
                    useAuthStore.getState().logout();
                }
            } catch (error: any) {
                // Ignore 401 errors as they are expected when a session naturally expires
                if (error.response?.status !== 401) {
                    console.error("Failed to fetch user session:", error.message || error);
                }
                useAuthStore.getState().logout();
            }
        } else {
            useAuthStore.getState().logout();
        }
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            Cookies.remove('is_logged_in', { path: '/' });
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
}));
