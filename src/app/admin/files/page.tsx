'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth';
import { Footer } from '@/components/layout/footer';
import { FileUploadWidget } from '@/components/admin/files/file-upload-widget';
import { FileListWidget } from '@/components/admin/files/file-list-widget';
import Link from 'next/link';

export default function AdminFilesPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const [refreshTrigger, setRefreshTrigger] = useState(0);

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

	const handleUploadSuccess = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
				<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<Link
								href="/admin"
								className="text-sm text-white/50 hover:text-primary transition-colors"
							>
								← Назад в панель
							</Link>
						</div>
						<h1 className="text-4xl font-bold tracking-tighter text-white sm:text-6xl">
							Файловый менеджер
						</h1>
						<p className="text-lg text-white/60">
							Загрузка и управление файлами сервера (карты, ресурсы и др.)
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<FileUploadWidget onUploadSuccess={handleUploadSuccess} />
					</div>
					<div className="lg:col-span-2">
						<FileListWidget refreshTrigger={refreshTrigger} />
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
