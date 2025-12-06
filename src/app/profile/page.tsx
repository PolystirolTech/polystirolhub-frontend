'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import type { ProviderConnection } from '@/lib/auth/types';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderConnection[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadProviders() {
      if (user) {
        try {
          const data = await authService.getUserProviders();
          setProviders(data);
        } catch (error) {
          console.error('Failed to load providers:', error);
        } finally {
          setLoadingProviders(false);
        }
      }
    }

    if (user) {
      loadProviders();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 pt-24">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen pb-20 pt-24">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-10">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
              Профиль
            </h1>
            <p className="text-lg text-muted">Управление вашим аккаунтом</p>
          </div>

          {/* User Info Card */}
          <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              {/* Avatar */}
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                    width={96}
                    height={96}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Details */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
                <p className="text-muted">{user.email || 'Email не указан'}</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-500/20 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm text-green-400">
                    {user.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 ml-2">
                  <span className="h-2 w-2 rounded-full bg-white"></span>
                  <span className="text-sm text-white">{user.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional sections can be added here */}

          <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8">
            <h3 className="text-xl font-bold text-white mb-6">Подключенные аккаунты</h3>

            {loadingProviders ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
              </div>
            ) : providers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {providers.map((conn) => (
                  <div
                    key={`${conn.provider}-${conn.provider_username}`}
                    className="flex items-center gap-4 rounded-xl bg-black/20 p-4 border border-white/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-2xl overflow-hidden">
                      {conn.provider_avatar ? (
                        <img
                          src={conn.provider_avatar}
                          alt={conn.provider_username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          {conn.provider === 'twitch' && <span className="i-bi-twitch text-[#9146FF]" />}
                          {conn.provider === 'discord' && <span className="i-bi-discord text-[#5865F2]" />}
                          {conn.provider !== 'twitch' && conn.provider !== 'discord' && (
                            <span className="capitalize text-xs">{conn.provider[0]}</span>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{conn.provider_username}</div>
                      <div className="text-xs text-muted capitalize">
                        {conn.provider} • {new Date(conn.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">
                Нет подключенных аккаунтов. Вы можете привязать их в настройках.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
