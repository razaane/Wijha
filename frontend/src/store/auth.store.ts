import { create } from 'zustand';

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
    token: typeof window !== 'undefined' ? localStorage.getItem('wijha_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('wijha_token') : false,

    setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wijha_token', token);
        }
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('wijha_token');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
