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
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null, // Token is now securely stored in an HttpOnly cookie and managed by the backend
    isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('is_logged_in') : false,

    setAuth: (user, token) => {
        // The token is now set automatically by the backend via HttpOnly cookies
        // We only keep the token parameter here for legacy compatibility in memory if needed
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            Cookies.remove('is_logged_in');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
