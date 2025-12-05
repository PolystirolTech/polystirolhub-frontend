'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SocialButton } from '@/components/ui/social-button';
import { useAuth } from '@/lib/auth';

// Simple Icons as components
const TwitchIcon = () => (
    <svg viewBox="0 0 64 64" fill="currentColor" className="h-full w-full" width="24" height="24">
        <path xmlns="http://www.w3.org/2000/svg" d="M5.7 0L1.4 10.985V55.88h15.284V64h8.597l8.12-8.12h12.418l16.716-16.716V0H5.7zm51.104 36.3L47.25 45.85H31.967l-8.12 8.12v-8.12H10.952V5.73h45.85V36.3zM47.25 16.716v16.716h-5.73V16.716h5.73zm-15.284 0v16.716h-5.73V16.716h5.73z" fill="#ffffffff" fillRule="evenodd" />
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="h-full w-full">
        <path
            xmlns="http://www.w3.org/2000/svg"
            d="M346 392l-21-25c41-11 57-39 57-39-52 49-194 51-249 0 0 0 14 26 56 39l-23 25c-70-1-97-48-97-48 0-104 46-187 46-187 47-33 90-33 90-33l3 4c-58 16-83 42-83 42 68-46 208-42 263 0 1-1-33-28-86-42l5-4s43 0 90 33c0 0 46 83 46 187 0 0-27 47-97 48z M163 279a33 35 0 1 0 66 0a33 35 0 1 0 -66 0z M279 279a33 35 0 1 0 66 0a33 35 0 1 0 -66 0z"
            fill="#fff"
            fillRule="evenodd"
        />
    </svg>
);

const SteamIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="h-full w-full">
        <rect xmlns="http://www.w3.org/2000/svg" height="512" rx="15%" fill="#231f20" />
        <path xmlns="http://www.w3.org/2000/svg" d="m183 280 41 28 27 41 87-62-94-96" />
        <circle xmlns="http://www.w3.org/2000/svg" cx="340" cy="190" r="49" />
        <g xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ebebeb"><circle cx="179" cy="352" r="63" strokeWidth="19" /><path d="m-18 271 195 81" strokeWidth="80" strokeLinecap="round" /><circle cx="340" cy="190" r="81" strokeWidth="32" /></g>
    </svg>
);

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/profile');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading while checking auth status
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info Block - Bento Card 1 */}
                <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex flex-col justify-center p-8 md:p-12 shadow-2xl">
                    <div className="mb-6">
                        <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">Привет!</h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Войдите в <Link href="/" className="text-primary font-semibold">polystirolhub</Link> чтобы получить доступ к вашему профилю, настроить настройки и подключиться к сообществу.
                        </p>
                    </div>
                    <div className="text-sm text-muted/60">
                        By logging in, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </div>

                {/* Login Buttons - Bento Card 2 */}
                <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex flex-col justify-center p-8 md:p-12 shadow-2xl">
                    <h2 className="mb-6 text-xl font-semibold text-white/90">Выберите провайдера</h2>
                    <div className="flex flex-col gap-4">
                        <SocialButton
                            provider="twitch"
                            icon={<TwitchIcon />}
                        />
                        <SocialButton
                            provider="discord"
                            icon={<DiscordIcon />}
                        />
                        <SocialButton
                            provider="steam"
                            icon={<SteamIcon />}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
