'use client';

/**
 * Authentication Error Page
 *
 * Displays errors that occur during OAuth authentication
 */

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthErrorContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const error = searchParams.get('error') || 'Unknown error';
	const errorDescription =
		searchParams.get('error_description') || 'An error occurred during authentication';

	const getErrorMessage = (errorCode: string) => {
		switch (errorCode) {
			case 'server_error':
				return 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.';
			case 'access_denied':
				return 'Вы отклонили запрос на авторизацию.';
			case 'invalid_request':
				return 'Некорректный запрос авторизации.';
			default:
				return errorDescription;
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="glass-card bg-white/5 max-w-md p-8 text-center">
				<div className="mb-4 text-6xl">⚠️</div>
				<h1 className="mb-4 text-2xl font-bold text-white">Ошибка авторизации</h1>
				<p className="mb-2 text-muted">{getErrorMessage(error)}</p>
				<p className="mb-6 text-sm text-muted/60">Код ошибки: {error}</p>
				<button
					onClick={() => router.push('/login')}
					className="inline-block rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary/90"
				>
					Вернуться к авторизации
				</button>
			</div>
		</div>
	);
}

export default function AuthErrorPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="glass-card bg-white/5 max-w-md p-8 text-center">
						<div className="mb-4 text-6xl">⚠️</div>
						<h1 className="mb-4 text-2xl font-bold text-white">Загрузка...</h1>
					</div>
				</div>
			}
		>
			<AuthErrorContent />
		</Suspense>
	);
}
