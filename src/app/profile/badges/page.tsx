'use client';

/**
 * My Badges Page
 *
 * Page for viewing and managing user's badges
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth';
import { badgeService } from '@/lib/badges/badge-service';
import { BadgeCard } from '@/components/badges/badge-card';
import { Input } from '@/components/ui/input';
import type { UserBadgeWithBadge } from '@/lib/api/generated';
import type { BadgeTypeValue } from '@/lib/badges/types';

type SortOption = 'date' | 'type' | 'name';

export default function MyBadgesPage() {
	const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
	const router = useRouter();
	const [badges, setBadges] = useState<UserBadgeWithBadge[]>([]);
	const [filteredBadges, setFilteredBadges] = useState<UserBadgeWithBadge[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<BadgeTypeValue | 'all'>('all');
	const [sortBy, setSortBy] = useState<SortOption>('date');
	const [isSelecting, setIsSelecting] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const PAGE_SIZE = 50;

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, authLoading, router]);

	// Load badges
	useEffect(() => {
		async function loadBadges() {
			if (!isAuthenticated) return;

			try {
				setIsLoading(true);
				setError(null);
				const skip = (page - 1) * PAGE_SIZE;
				const data = await badgeService.getMyBadges(skip, PAGE_SIZE);
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
	}, [isAuthenticated, page]);

	// Filter and sort badges
	useEffect(() => {
		let filtered = [...badges];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((item) => {
				const name =
					typeof item.badge.name === 'string' ? item.badge.name : String(item.badge.name || '');
				const description =
					typeof item.badge.description === 'string'
						? item.badge.description
						: String(item.badge.description || '');
				return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
			});
		}

		// Filter by type
		if (typeFilter !== 'all') {
			filtered = filtered.filter((item) => {
				const badgeType =
					typeof item.badge.badgeType === 'string'
						? item.badge.badgeType
						: String(item.badge.badgeType || '');
				return badgeType === typeFilter;
			});
		}

		// Sort
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'date':
					return new Date(b.receivedAt || '').getTime() - new Date(a.receivedAt || '').getTime();
				case 'type': {
					const typeA =
						typeof a.badge.badgeType === 'string'
							? a.badge.badgeType
							: String(a.badge.badgeType || '');
					const typeB =
						typeof b.badge.badgeType === 'string'
							? b.badge.badgeType
							: String(b.badge.badgeType || '');
					return typeA.localeCompare(typeB);
				}
				case 'name':
					return (a.badge.name || '').localeCompare(b.badge.name || '');
				default:
					return 0;
			}
		});

		setFilteredBadges(filtered);
	}, [badges, searchQuery, typeFilter, sortBy]);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (page !== 1) {
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, typeFilter, sortBy]);

	const handleSelectBadge = async (badgeId: string) => {
		try {
			setIsSelecting(badgeId);
			await badgeService.selectBadge(badgeId);
			await refreshUser(); // Refresh user to get updated selected_badge_id
			// Reload badges to update selected state
			const data = await badgeService.getMyBadges();
			setBadges(data);
		} catch (err) {
			console.error('Failed to select badge:', err);
			const errorMessage = err instanceof Error ? err.message : 'Не удалось выбрать бэйджик';
			alert(errorMessage);
		} finally {
			setIsSelecting(null);
		}
	};

	const handleDeselectBadge = async () => {
		try {
			setIsSelecting('deselect');
			await badgeService.deselectBadge();
			await refreshUser(); // Refresh user to get updated selected_badge_id
			// Reload badges to update selected state
			const data = await badgeService.getMyBadges();
			setBadges(data);
		} catch (err) {
			console.error('Failed to deselect badge:', err);
			alert('Не удалось снять бэйджик');
		} finally {
			setIsSelecting(null);
		}
	};

	if (authLoading || isLoading) {
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

	if (!isAuthenticated) {
		return null;
	}

	const selectedBadgeId = user?.selected_badge_id;

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Мои бэджики
					</h1>
					<p className="text-lg text-white/60">Управление вашими наградами</p>
				</div>

				{/* Filters and Search */}
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

						{/* Sort */}
						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60 whitespace-nowrap">Сортировка:</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							>
								<option value="date">По дате</option>
								<option value="type">По типу</option>
								<option value="name">По названию</option>
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

				{/* Badges List */}
				{filteredBadges.length === 0 && !isLoading ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
						<p className="text-white/60">
							{searchQuery || typeFilter !== 'all'
								? 'Бэджики не найдены'
								: 'У вас пока нет бэджиков'}
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredBadges.map((item) => {
								const isSelected = item.badge.id === selectedBadgeId;
								const badgeType =
									typeof item.badge.badgeType === 'string'
										? item.badge.badgeType
										: String(item.badge.badgeType || '');
								const expiresAt =
									typeof item.expiresAt === 'string' || item.expiresAt === null
										? item.expiresAt
										: String(item.expiresAt || '');
								return (
									<BadgeCard
										key={item.id}
										badge={{ ...item.badge, badgeType: badgeType as BadgeTypeValue }}
										receivedAt={item.receivedAt}
										expiresAt={expiresAt}
										isSelected={isSelected}
										onSelect={isSelected ? undefined : () => handleSelectBadge(item.badge.id || '')}
										onDeselect={isSelected ? handleDeselectBadge : undefined}
										isSelecting={isSelecting === item.badge.id || isSelecting === 'deselect'}
									/>
								);
							})}
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
			</main>
		</div>
	);
}
