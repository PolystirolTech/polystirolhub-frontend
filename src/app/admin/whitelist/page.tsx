'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth';
import { WhitelistAdminWidget } from '@/components/admin/whitelist/whitelist-admin-widget';

export default function AdminWhitelistPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

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
					<Link
						href="/admin"
						className="text-sm text-primary hover:text-primary/80 mb-2 inline-block"
					>
						← Админ панель
					</Link>
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Вайтлист
					</h1>
					<p className="text-lg text-white/60">Заявки в вайтлист и ручное добавление</p>
				</div>

				<WhitelistAdminWidget />
			</main>

			<Footer />
		</div>
	);
}
