'use client';

/**
 * OAuth Success Page
 * 
 * Handles successful OAuth authentication.
 * Backend has already processed OAuth and set HTTP-only cookie.
 * We just need to refresh user state and redirect to profile.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthSuccessPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();

    useEffect(() => {
        const handleSuccess = async () => {
            try {
                // Small delay to ensure cookie is set
                await new Promise(resolve => setTimeout(resolve, 300));

                // Refresh user data from backend
                await refreshUser();

                // Redirect to profile page
                router.push('/profile');
            } catch (err) {
                console.error('Error loading user after auth:', err);
                // If refresh fails, redirect to login
                router.push('/login');
            }
        };

        handleSuccess();
    }, [refreshUser, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card bg-white/5 max-w-md p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-white">Успешная авторизация! ✅</h1>
                <p className="text-muted">Загружаем ваш профиль...</p>
            </div>
        </div>
    );
}
