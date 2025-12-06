'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import type { ProviderConnection } from '@/lib/auth/types';
import { useState } from 'react';
import { SocialButton } from '@/components/ui/social-button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

import { useLevel } from '@/lib/level/level-context';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { level, currentXp, nextLevelXp, addXp, resetLevel, error: levelError } = useLevel();
  const [providers, setProviders] = useState<ProviderConnection[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const [unlinkModal, setUnlinkModal] = useState<{ isOpen: boolean; provider: string | null }>({
    isOpen: false,
    provider: null,
  });
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  // Check if debug mode is enabled (default to true if not set)
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG !== 'false';

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

  const handleUnlinkProvider = async () => {
    if (!unlinkModal.provider) return;

    try {
      await authService.unlinkProvider(unlinkModal.provider);
      // Refresh providers list
      const data = await authService.getUserProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to unlink provider:', error);
      // Ideally show a toast notification here
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount();
      // Redirect to home or login after deletion (auth context should handle logout state update if needed,
      // but usually we want to force a full cleanup)
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

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
        <div className="">
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
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary shrink-0">
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
              <div className="flex-1">
                <div className="flex items-start justify-between">
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

                  {/* Level Badge */}
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/30 px-6 py-3 backdrop-blur-sm">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                      Уровень
                    </span>
                    <span className="text-3xl font-bold text-primary">{level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="relative pt-2">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-white">{currentXp} XP</span>
                <span className="text-muted">{nextLevelXp} XP</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)]/50 to-primary transition-all duration-500 ease-out"
                  style={{ width: `${(currentXp / nextLevelXp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Debug / XP Controls - Only in Debug Mode */}
          {isDebugMode && (
            <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 mb-6">
              <h3 className="text-xl font-bold text-white mb-6">Дебаг: Добавить опыт</h3>
              {levelError && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {levelError}
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => addXp(50)}
                  className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                >
                  +50 XP
                </button>
                <button
                  onClick={() => addXp(100)}
                  className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                >
                  +100 XP
                </button>
                <button
                  onClick={() => addXp(500)}
                  className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                >
                  +500 XP
                </button>
                <button
                  onClick={() => addXp(1000)}
                  className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                >
                  +1000 XP
                </button>
                <div className="h-auto w-px bg-white/20 mx-2"></div>
                <button
                  onClick={resetLevel}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Сбросить
                </button>
              </div>
            </div>
          )}

          {/* Connected Accounts */}
          <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 mb-6">
            <h3 className="text-xl font-bold text-white mb-6">Подключенные аккаунты</h3>

            {loadingProviders ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Render connected providers or link buttons */}
                {(['twitch', 'discord', 'steam'] as const).map((providerName) => {
                  const connection = providers.find((p) => p.provider === providerName);

                  if (connection) {
                    return (
                      <div
                        key={`${connection.provider}-${connection.provider_username}`}
                        className="flex items-center gap-4 rounded-xl bg-black/20 p-4 border border-white/5 group relative"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-2xl overflow-hidden">
                          {connection.provider_avatar ? (
                            <Image
                              src={connection.provider_avatar}
                              alt={connection.provider_username}
                              className="h-full w-full object-cover"
                              width={48}
                              height={48}
                              unoptimized
                            />
                          ) : (
                            <>
                              {connection.provider === 'twitch' && (
                                <span className="i-bi-twitch text-[#9146FF]" />
                              )}
                              {connection.provider === 'discord' && (
                                <span className="i-bi-discord text-[#5865F2]" />
                              )}
                              {connection.provider === 'steam' && (
                                <span className="i-bi-steam text-[#fff]" />
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {connection.provider_username}
                          </div>
                          <div className="text-xs text-muted capitalize">
                            {connection.provider} •{' '}
                            {new Date(connection.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {/* Unlink Button - Only show if more than 1 provider */}
                          {providers.length > 1 && (
                            <button
                              onClick={() =>
                                setUnlinkModal({
                                  isOpen: true,
                                  provider: connection.provider,
                                })
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                              title="Отвязать аккаунт"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <SocialButton
                      key={providerName}
                      provider={providerName}
                      onClick={() => authService.initiateLink(providerName)}
                    >
                      Привязать {providerName.charAt(0).toUpperCase() + providerName.slice(1)}
                    </SocialButton>
                  );
                })}
              </div>
            )}
          </div>

          {/* Danger Zone / Delete Account */}
          <div className="glass-card bg-red-500/30 backdrop-blur-md border border-red-500/10 p-8">
            <h3 className="text-xl font-bold text-red-400 mb-2">Удаление аккаунта</h3>
            <p className="text-muted text-sm mb-6">
              Это действие необратимо. Все ваши данные будут удалены без возможности восстановления.
            </p>

            <button
              onClick={() => setDeleteAccountModal(true)}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-medium transition-all hover:bg-red-500/20 hover:scale-[1.02] cursor-pointer"
            >
              Удалить аккаунт
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      {unlinkModal.isOpen && (
        <ConfirmationModal
          isOpen={unlinkModal.isOpen}
          onClose={() => setUnlinkModal({ isOpen: false, provider: null })}
          onConfirm={handleUnlinkProvider}
          title="Отвязка аккаунта"
          message={`Вы уверены, что хотите отвязать этот аккаунт? Вы больше не сможете входить через него.`}
          confirmText="Отвязать"
          isDangerous
        />
      )}

      {deleteAccountModal && (
        <ConfirmationModal
          isOpen={deleteAccountModal}
          onClose={() => setDeleteAccountModal(false)}
          onConfirm={handleDeleteAccount}
          title="Удаление аккаунта"
          message={`Это действие полностью удалит ваш аккаунт и все связанные данные. Это действие НЕОБРАТИМО.`}
          confirmText="Удалить навсегда"
          isDangerous
          validationString={user.username}
          validationPlaceholder="Введите ваш никнейм"
        />
      )}
    </div>
  );
}
