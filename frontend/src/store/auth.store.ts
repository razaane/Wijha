import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
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
    token: typeof window !== 'undefined' ? Cookies.get('wijha_token') || null : null,
    isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('wijha_token') : false,

    setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
            Cookies.set('wijha_token', token, { expires: 7, secure: true, sameSite: 'lax' });
        }
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            Cookies.remove('wijha_token');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
