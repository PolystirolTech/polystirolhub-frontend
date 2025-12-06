'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function LinkSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const success = searchParams.get('success');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Small delay to ensure any backend side effects are propagated if needed
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Refresh user data from backend to get the new provider
        await refreshUser();

        // Redirect to profile page
        router.push('/profile');
      } catch (err) {
        console.error('Error refreshing user after link:', err);
        // If refresh fails, still try to go to profile
        router.push('/profile');
      }
    };

    if (success === 'true') {
      handleSuccess();
    } else {
      // If arrived here without success=true, just redirect
      router.push('/profile');
    }
  }, [refreshUser, router, success]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card bg-white/5 max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Аккаунт успешно привязан! ✅</h1>
        <p className="text-muted">Возвращаемся в профиль...</p>
      </div>
    </div>
  );
}

export default function LinkSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card bg-white/5 max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            </div>
            <p className="text-muted">Загрузка...</p>
          </div>
        </div>
      }
    >
      <LinkSuccessContent />
    </Suspense>
  );
}
