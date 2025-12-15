'use client';

/**
 * Public Badges Page
 *
 * Public catalog of all available badges
 */

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { badgeService } from '@/lib/badges/badge-service';
import { BadgeImage } from '@/components/badges/badge-image';
import { BadgeTypeBadge } from '@/components/badges/badge-type-badge';
import { Input } from '@/components/ui/input';
import type { Badge } from '@/lib/api/generated';
import type { BadgeTypeValue } from '@/lib/badges/types';
import { formatBadgeDate } from '@/lib/badges/types';

export default function BadgesPage() {
	const [badges, setBadges] = useState<Badge[]>([]);
	const [filteredBadges, setFilteredBadges] = useState<Badge[]>([]);
	const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<BadgeTypeValue | 'all'>('all');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const PAGE_SIZE = 50;

	// Load badges
	useEffect(() => {
		async function loadBadges() {
			try {
				setIsLoading(true);
				setError(null);
				const skip = (page - 1) * PAGE_SIZE;
				const data = await badgeService.getAllBadges(skip, PAGE_SIZE);
				setBadges(data);
				setFilteredBadges(data);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err) {
				console.error('Failed to load badges:', err);
				setError('Не удалось загрузить бэджики');
			} finally {
				setIsLoading(false);
			}
		}

		loadBadges();
	}, [page]);

	// Filter badges
	useEffect(() => {
		let filtered = [...badges];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((badge) => {
				const name = typeof badge.name === 'string' ? badge.name : String(badge.name || '');
				const description =
					typeof badge.description === 'string'
						? badge.description
						: String(badge.description || '');
				return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
			});
		}

		// Filter by type
		if (typeFilter !== 'all') {
			filtered = filtered.filter((badge) => {
				const badgeType =
					typeof badge.badgeType === 'string' ? badge.badgeType : String(badge.badgeType || '');
				return badgeType === typeFilter;
			});
		}

		setFilteredBadges(filtered);
	}, [badges, searchQuery, typeFilter]);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (page !== 1) {
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, typeFilter]);

	const handleBadgeClick = async (badge: Badge) => {
		try {
			const badgeData = await badgeService.getBadge(badge.id || '');
			setSelectedBadge(badgeData);
		} catch (err) {
			console.error('Failed to load badge details:', err);
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
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Бэджики
					</h1>
					<p className="text-lg text-white/60">Каталог всех доступных наград</p>
				</div>

				{/* Filters */}
				<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 mb-6">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<Input
								type="text"
								placeholder="Поиск по названию..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full"
							/>
						</div>

						{/* Type Filter */}
						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60 whitespace-nowrap">Тип:</label>
							<select
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value as BadgeTypeValue | 'all')}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							>
								<option value="all">Все</option>
								<option value="permanent">Постоянные</option>
								<option value="temporary">Временные</option>
								<option value="event">Ивентовые</option>
							</select>
						</div>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="glass-card bg-red-500/20 border border-red-500/50 p-4 mb-6">
						<p className="text-red-400">{error}</p>
					</div>
				)}

				{/* Badges Grid */}
				{filteredBadges.length === 0 && !isLoading ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
						<p className="text-white/60">
							{searchQuery || typeFilter !== 'all' ? 'Бэджики не найдены' : 'Бэджики не найдены'}
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{filteredBadges.map((badge) => (
								<button
									key={badge.id}
									onClick={() => handleBadgeClick(badge)}
									className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 rounded-lg text-left transition-all hover:border-white/20 hover:scale-[1.02] cursor-pointer"
								>
									<div className="flex flex-col items-center gap-3">
										<BadgeImage src={badge.imageUrl || ''} alt={badge.name || ''} size="xl" />
										<div className="text-center w-full">
											<h3 className="text-lg font-bold text-white mb-1">{badge.name}</h3>
											{badge.badgeType && (
												<BadgeTypeBadge
													type={
														typeof badge.badgeType === 'string'
															? badge.badgeType
															: String(badge.badgeType || '')
													}
												/>
											)}
										</div>
									</div>
								</button>
							))}
						</div>

						{/* Pagination */}
						{(hasMore || page > 1) && (
							<div className="flex items-center justify-between mt-6">
								<button
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1 || isLoading}
									className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Назад
								</button>
								<span className="text-sm text-white/60">Страница {page}</span>
								<button
									onClick={() => setPage((p) => p + 1)}
									disabled={!hasMore || isLoading}
									className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Вперед
								</button>
							</div>
						)}
					</>
				)}

				{/* Badge Detail Modal */}
				{selectedBadge && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
						{/* Backdrop */}
						<div
							className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
							onClick={() => setSelectedBadge(null)}
						/>

						{/* Modal */}
						<div className="glass-card bg-[var(--color-secondary)] relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-bold text-white">Информация о бэйдже</h2>
								<button
									onClick={() => setSelectedBadge(null)}
									className="text-white/60 hover:text-white transition-colors"
								>
									✕
								</button>
							</div>

							<div className="flex flex-col items-center gap-4 mb-6">
								<BadgeImage
									src={selectedBadge.imageUrl || ''}
									alt={selectedBadge.name || ''}
									size="xl"
								/>
								<div className="text-center">
									<h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
									{selectedBadge.badgeType && (
										<BadgeTypeBadge
											type={
												typeof selectedBadge.badgeType === 'string'
													? selectedBadge.badgeType
													: String(selectedBadge.badgeType || '')
											}
										/>
									)}
								</div>
							</div>

							{selectedBadge.description && (
								<p className="text-white/70 mb-4">
									{typeof selectedBadge.description === 'string'
										? selectedBadge.description
										: String(selectedBadge.description || '')}
								</p>
							)}

							<div className="text-xs text-white/60">
								Создан: {formatBadgeDate(selectedBadge.createdAt)}
							</div>

							<div className="flex justify-end mt-6">
								<button
									onClick={() => setSelectedBadge(null)}
									className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium transition-colors hover:bg-white/20"
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
