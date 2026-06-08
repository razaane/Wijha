"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            localStorage.setItem('auth_token', token);
            
            api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setAuth(response.data, token);
                router.push('/dashboard');
            })
            .catch(error => {
                console.error("Failed to fetch user profile", error);
                router.push('/login?error=auth_failed');
            });
        } else {
            router.push('/login?error=no_token');
        }
    }, [router, searchParams, setAuth]);

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
