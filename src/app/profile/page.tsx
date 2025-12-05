'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
              </div>
            </div>

            {/* Account Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4">
                <p className="text-sm text-muted mb-1">ID пользователя</p>
                <p className="text-lg font-semibold text-white">{user.id}</p>
              </div>
              <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4">
                <p className="text-sm text-muted mb-1">Статус</p>
                <p className="text-lg font-semibold text-white">
                  {user.is_active ? '✅ Активен' : '❌ Неактивен'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional sections can be added here */}
          <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8">
            <h3 className="text-xl font-bold text-white mb-4">Подключенные аккаунты</h3>
            <p className="text-muted">
              Информация о подключенных OAuth провайдерах скоро будет доступна.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
