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
                } else {
                    useAuthStore.getState().logout();
                }
            } catch (error) {
                console.error("Failed to fetch user session:", error);
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
