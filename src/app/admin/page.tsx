'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth';
import { UserAdminWidget } from '@/components/admin/user-admin-widget';
import { GameTypesWidget } from '@/components/admin/game-types-widget';
import { ServerCreateForm } from '@/components/admin/server-create-form';
import { ServersListWidget } from '@/components/admin/servers-list-widget';
import Link from 'next/link';
import { Footer } from '@/components/layout/footer';

export default function AdminPage() {
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
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
				<div className="mb-6">
					<h1 className="mb-2 text-3xl sm:text-4xl font-bold tracking-tighter text-white md:text-6xl">
						Админ панель
					</h1>
					<p className="text-lg text-white/60">Управление системой</p>
				</div>

				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
					<div className="mb-3">
						<h2 className="text-sm font-bold text-white mb-2">
							Добро пожаловать, {user.username}!
						</h2>
						{user.is_super_admin && (
							<div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/20 px-3 py-1 mb-2">
								<span className="h-2 w-2 rounded-full bg-purple-500"></span>
								<span className="text-xs text-purple-400">Супер администратор</span>
							</div>
						)}
						{user.is_admin && !user.is_super_admin && (
							<div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1 mb-2">
								<span className="h-2 w-2 rounded-full bg-blue-500"></span>
								<span className="text-xs text-blue-400">Администратор</span>
							</div>
						)}
					</div>
					<div className="flex items-center gap-4 flex-wrap">
						<p className="text-xs text-white/60">Страница администрирования.</p>
						<Link
							href="/admin/badges"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Управление бэджиками →
						</Link>
						<Link
							href="/admin/quests"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Управление квестами →
						</Link>
						<Link
							href="/admin/resource-collection"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Управление целями сбора ресурсов →
						</Link>
						<Link
							href="/admin/files"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Файловый менеджер →
						</Link>
						<Link
							href="/admin/whitelist"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Вайтлист →
						</Link>
						<Link
							href="/admin/shop"
							className="text-xs text-primary hover:text-primary/80 transition-colors underline"
						>
							Магазин →
						</Link>
					</div>
				</div>

				{/* Grid layout для виджетов */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Левая колонка */}
					<div className="flex flex-col gap-6 lg:col-span-4">
						{/* Виджет управления админами (только для super admin) */}
						{user.is_super_admin && <UserAdminWidget />}

						{/* Управление типами игр */}
						<GameTypesWidget />
					</div>

					{/* Правая колонка - форма создания сервера */}
					<div className="lg:col-span-8">
						<ServerCreateForm />
					</div>
				</div>

				{/* Список серверов */}
				<ServersListWidget />
			</main>
		</div>
	);
}
