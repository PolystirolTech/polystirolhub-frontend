'use client';

/**
 * Badges List Widget
 *
 * Widget for displaying and managing badges in admin panel
 */

import { useEffect, useState, useCallback } from 'react';
import { badgeService } from '@/lib/badges/badge-service';
import { BadgeImage } from '@/components/badges/badge-image';
import { BadgeTypeBadge } from '@/components/badges/badge-type-badge';
import { BadgeCreateForm } from './badge-create-form';
import { BadgeEditModal } from './badge-edit-modal';
import { BadgeAwardModal } from './badge-award-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Badge } from '@/lib/api/generated';
import type { BadgeTypeValue } from '@/lib/badges/types';
import { formatBadgeDate } from '@/lib/badges/types';

const PAGE_SIZE = 50;

export function BadgesListWidget() {
	const [badges, setBadges] = useState<Badge[]>([]);
	const [filteredBadges, setFilteredBadges] = useState<Badge[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<BadgeTypeValue | 'all'>('all');
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
	const [awardingBadge, setAwardingBadge] = useState<Badge | null>(null);
	const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const loadBadges = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const skip = (page - 1) * PAGE_SIZE;
			const data = await badgeService.getAllBadgesAdmin(skip, PAGE_SIZE);
			setBadges(data);
			setFilteredBadges(data);
			setHasMore(data.length === PAGE_SIZE);
		} catch (err) {
			console.error('Failed to load badges:', err);
			setError('Не удалось загрузить бэджики');
		} finally {
			setIsLoading(false);
		}
	}, [page]);

	// Load badges
	useEffect(() => {
		loadBadges();
	}, [loadBadges]);

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

	const handleDeleteBadge = async () => {
		if (!deletingBadge) return;

		try {
			await badgeService.deleteBadge(deletingBadge.id || '');
			await loadBadges();
			setDeletingBadge(null);
		} catch (err) {
			console.error('Failed to delete badge:', err);
			alert('Не удалось удалить бэйджик');
		}
	};

	const handleCreateSuccess = () => {
		setShowCreateForm(false);
		loadBadges();
	};

	const handleEditSuccess = () => {
		setEditingBadge(null);
		loadBadges();
	};

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8">
				<div className="flex justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Controls */}
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
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

					{/* Create Button */}
					<Button onClick={() => setShowCreateForm(true)}>Создать бэйджик</Button>
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
						{searchQuery || typeFilter !== 'all' ? 'Бэджики не найдены' : 'Бэджики не созданы'}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredBadges.map((badge) => (
							<div
								key={badge.id}
								className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 rounded-lg"
							>
								<div className="flex items-start gap-4 mb-4">
									<BadgeImage src={badge.imageUrl || ''} alt={badge.name || ''} size="lg" />
									<div className="flex-1 min-w-0">
										<h3 className="text-lg font-bold text-white truncate mb-1">{badge.name}</h3>
										{badge.description && (
											<p className="text-sm text-white/70 line-clamp-2 mb-2">
												{typeof badge.description === 'string'
													? badge.description
													: String(badge.description || '')}
											</p>
										)}
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

								<div className="text-xs text-white/60 mb-4">
									Создан: {formatBadgeDate(badge.createdAt)}
								</div>

								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setEditingBadge(badge)}
										className="flex-1"
									>
										Редактировать
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setAwardingBadge(badge)}
										className="flex-1"
									>
										Выдать
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => setDeletingBadge(badge)}
										className="flex-1 text-red-500"
									>
										X
									</Button>
								</div>
							</div>
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

			{/* Create Form */}
			{showCreateForm && (
				<BadgeCreateForm
					onSuccess={handleCreateSuccess}
					onCancel={() => setShowCreateForm(false)}
				/>
			)}

			{/* Edit Modal */}
			{editingBadge && (
				<BadgeEditModal
					badge={editingBadge}
					onSuccess={handleEditSuccess}
					onCancel={() => setEditingBadge(null)}
				/>
			)}

			{/* Award Modal */}
			{awardingBadge && (
				<BadgeAwardModal
					badge={awardingBadge}
					onSuccess={() => {
						setAwardingBadge(null);
					}}
					onCancel={() => setAwardingBadge(null)}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmationModal
				isOpen={!!deletingBadge}
				onClose={() => setDeletingBadge(null)}
				onConfirm={handleDeleteBadge}
				title="Удалить бэйджик?"
				message={`Вы уверены, что хотите удалить бэйджик "${deletingBadge?.name}"? Это действие удалит бэйджик у всех пользователей и не может быть отменено.`}
				confirmText="Удалить"
				cancelText="Отмена"
				isDangerous={true}
			/>
		</>
	);
}
