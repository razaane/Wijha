"use client";

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        // The backend now sets JWT via HttpOnly cookies on the redirect.
        // We just need to call /auth/me with withCredentials: true (already configured in api.ts)
        // to fetch the user profile using the cookie the browser automatically sends.
        api.get('/auth/me')
            .then(response => {
                const user = response.data.data;
                setAuth(user, ''); // Token is managed via HttpOnly cookie, no need to store it
                router.push('/dashboard');
            })
            .catch(error => {
                console.error("Failed to fetch user profile", error);
                router.push('/login?error=auth_failed');
            });
    }, [router, setAuth]);

    return null;
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-neutral-800">Authenticating...</h2>
            <p className="text-neutral-500">Please wait while we log you in.</p>
            
            <Suspense fallback={null}>
                <AuthCallbackContent />
            </Suspense>
        </div>
    );
}
