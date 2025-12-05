'use client';

/**
 * OAuth Callback Handler
 * 
 * Handles the OAuth provider callback after backend processes it.
 * Backend has already exchanged code for token and set HTTP-only cookie.
 * We just need to refresh user state and redirect.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function CallbackPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Backend has already processed the callback and set cookie
                // We just need to refresh user state
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for cookie to be set

                await refreshUser();

                // Redirect to profile page
                router.push('/profile');
            } catch (err) {
                console.error('Callback processing error:', err);
                // If refresh fails, redirect to login
                router.push('/login');
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [refreshUser, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card bg-white/5 max-w-md p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-white">Завершаем вход...</h1>
                <p className="text-muted">Пожалуйста, подождите.</p>
            </div>
        </div>
    );
}
