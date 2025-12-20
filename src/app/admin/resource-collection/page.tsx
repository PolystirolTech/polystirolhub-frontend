'use client';

/**
 * Admin Resource Collection Page
 *
 * Page for managing resource collection goals (admin only)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth';
import { GoalsListWidget } from '@/components/admin/resource-collection/goals-list-widget';
import { Footer } from '@/components/layout/footer';

export default function AdminResourceCollectionPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	// Redirect if not admin
	useEffect(() => {
		if (!isLoading && user && !user.is_admin && !user.is_super_admin) {
			router.push('/');
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
						<div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!user || (!user.is_admin && !user.is_super_admin)) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8">
						<h1 className="mb-4 text-2xl font-bold text-white">Доступ запрещен</h1>
						<p className="text-white/60">У вас нет прав для доступа к этой странице.</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
				<div className="mb-6">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Управление целями сбора ресурсов
					</h1>
					<p className="text-lg text-white/60">
						Создание и управление целями сбора ресурсов по серверам
					</p>
				</div>

				<GoalsListWidget />
			</main>

			<Footer />
		</div>
	);
}
