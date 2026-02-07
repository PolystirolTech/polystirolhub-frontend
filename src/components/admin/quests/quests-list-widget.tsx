'use client';

/**
 * Quests List Widget
 *
 * Widget for displaying and managing quests in admin panel
 */

import { useCallback, useEffect, useState } from 'react';
import { questService } from '@/lib/quests';
import { QuestCreateForm } from './quest-create-form';
import { QuestEditModal } from './quest-edit-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Quest } from '@/lib/quests';
import { formatQuestName, formatQuestDescription } from '@/lib/utils/quest-formatters';

type QuestWithRewardBalance = Quest & {
	rewardBalance?: number | null;
};

const PAGE_SIZE = 50;

export function QuestsListWidget() {
	const [quests, setQuests] = useState<Quest[]>([]);
	const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState<'all' | 'daily' | 'achievement'>('all');
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
	const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	// Load quests
	const loadQuests = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const skip = (page - 1) * PAGE_SIZE;
			const data = await questService.getAllQuestsAdmin(skip, PAGE_SIZE);
			setQuests(data);
			setFilteredQuests(data);
			setHasMore(data.length === PAGE_SIZE);
		} catch (err) {
			console.error('Failed to load quests:', err);
			setError('Не удалось загрузить квесты');
		} finally {
			setIsLoading(false);
		}
	}, [page]);

	useEffect(() => {
		loadQuests();
	}, [loadQuests]);

	// Filter quests
	useEffect(() => {
		let filtered = [...quests];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((quest) => {
				const name = formatQuestName(quest.name);
				const description = formatQuestDescription(quest.description);
				return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
			});
		}

		// Filter by type
		if (typeFilter !== 'all') {
			filtered = filtered.filter((quest) => {
				const questType = String(quest.questType || '');
				return questType === typeFilter;
			});
		}

		setFilteredQuests(filtered);
	}, [quests, searchQuery, typeFilter]);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (page !== 1) {
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, typeFilter]);

	const handleDeleteQuest = async () => {
		if (!deletingQuest) return;

		try {
			await questService.deleteQuest(String(deletingQuest.id || ''));
			await loadQuests();
			setDeletingQuest(null);
		} catch (err) {
			console.error('Failed to delete quest:', err);
			alert('Не удалось удалить квест');
		}
	};

	const handleCreateSuccess = () => {
		setShowCreateForm(false);
		loadQuests();
	};

	const handleEditSuccess = () => {
		setEditingQuest(null);
		loadQuests();
	};

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8">
				<div className="flex justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Controls */}
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 mb-6">
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
							onChange={(e) => setTypeFilter(e.target.value as 'all' | 'daily' | 'achievement')}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="all">Все</option>
							<option value="daily">Ежедневные</option>
							<option value="achievement">Достижения</option>
						</select>
					</div>

					{/* Create Button */}
					<Button onClick={() => setShowCreateForm(true)}>Создать квест</Button>
				</div>
			</div>

			{/* Error */}
			{error && (
				<div className="glass-card bg-red-500/20 backdrop-blur-md border border-red-500/50 p-4 mb-6">
					<p className="text-red-400">{error}</p>
				</div>
			)}

			{/* Quests Grid */}
			{filteredQuests.length === 0 && !isLoading ? (
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 text-center">
					<p className="text-white/60">
						{searchQuery || typeFilter !== 'all' ? 'Квесты не найдены' : 'Квесты не созданы'}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredQuests.map((quest) => {
							const questName = formatQuestName(quest.name);
							const questDescription = formatQuestDescription(quest.description);
							const questType = String(quest.questType || '');
							const isActive = quest.isActive !== false;

							return (
								<div
									key={quest.id}
									className={`glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 rounded-lg ${
										!isActive ? 'opacity-60' : ''
									}`}
								>
									<div className="mb-4">
										<div className="flex items-start justify-between mb-2">
											<h3 className="text-lg font-bold text-white truncate flex-1">{questName}</h3>
											<div className="flex items-center gap-2 ml-2">
												{questType === 'daily' && (
													<span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
														Daily
													</span>
												)}
												{questType === 'achievement' && (
													<span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
														Achievement
													</span>
												)}
												{!isActive && (
													<span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs">
														Неактивен
													</span>
												)}
											</div>
										</div>
										{questDescription && (
											<p className="text-sm text-white/70 line-clamp-2 mb-2">{questDescription}</p>
										)}
										<div className="text-xs text-white/60 space-y-1">
											{quest.conditionKey && (
												<div>
													Условие:{' '}
													<span className="text-white/80">{String(quest.conditionKey)}</span>
												</div>
											)}
											{quest.targetValue !== null && quest.targetValue !== undefined && (
												<div>
													Цель: <span className="text-white/80">{quest.targetValue}</span>
												</div>
											)}
											{quest.rewardXp !== null && quest.rewardXp !== undefined && (
												<div>
													Награда XP: <span className="text-white/80">{quest.rewardXp}</span>
												</div>
											)}
											{(quest as QuestWithRewardBalance).rewardBalance !== null &&
												(quest as QuestWithRewardBalance).rewardBalance !== undefined && (
													<div>
														Награда в валюте:{' '}
														<span className="text-white/80">
															{(quest as QuestWithRewardBalance).rewardBalance}
														</span>
													</div>
												)}
										</div>
									</div>

									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setEditingQuest(quest)}
											className="flex-1"
										>
											Редактировать
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => setDeletingQuest(quest)}
											className="flex-1 text-red-500"
										>
											X
										</Button>
									</div>
								</div>
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

			{/* Create Form */}
			{showCreateForm && (
				<QuestCreateForm
					onSuccess={handleCreateSuccess}
					onCancel={() => setShowCreateForm(false)}
				/>
			)}

			{/* Edit Modal */}
			{editingQuest && (
				<QuestEditModal
					quest={editingQuest}
					onSuccess={handleEditSuccess}
					onCancel={() => setEditingQuest(null)}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmationModal
				isOpen={!!deletingQuest}
				onClose={() => setDeletingQuest(null)}
				onConfirm={handleDeleteQuest}
				title="Удалить квест?"
				message={`Вы уверены, что хотите удалить квест "${formatQuestName(deletingQuest?.name)}"? Это действие не может быть отменено.`}
				confirmText="Удалить"
				cancelText="Отмена"
				isDangerous={true}
			/>
		</>
	);
}
