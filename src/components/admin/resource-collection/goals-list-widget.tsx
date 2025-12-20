'use client';

/**
 * Goals List Widget
 *
 * Widget for displaying and managing resource collection goals in admin panel
 */

import { useEffect, useState, useCallback } from 'react';
import { resourceCollectionService } from '@/lib/resource-collection';
import { GoalCreateForm } from './goal-create-form';
import { GoalEditModal } from './goal-edit-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ResourceGoal } from '@/lib/resource-collection';
import { gameService } from '@/lib/game/game-service';
import type { GameServerResponse } from '@/lib/api/generated';

const PAGE_SIZE = 50;

export function GoalsListWidget() {
	const [goals, setGoals] = useState<ResourceGoal[]>([]);
	const [filteredGoals, setFilteredGoals] = useState<ResourceGoal[]>([]);
	const [servers, setServers] = useState<GameServerResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [serverFilter, setServerFilter] = useState<string>('all');
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingGoal, setEditingGoal] = useState<ResourceGoal | null>(null);
	const [deletingGoal, setDeletingGoal] = useState<ResourceGoal | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	// Load servers for filter
	useEffect(() => {
		async function loadServers() {
			try {
				const serverList = await gameService.getAdminGameServers();
				setServers(serverList);
			} catch (err) {
				console.error('Failed to load servers:', err);
			}
		}
		loadServers();
	}, []);

	// Load goals
	const loadGoals = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const skip = (page - 1) * PAGE_SIZE;
			const serverId = serverFilter !== 'all' ? serverFilter : undefined;
			const data = await resourceCollectionService.getGoals(serverId, skip, PAGE_SIZE);
			setGoals(data);
			setFilteredGoals(data);
			setHasMore(data.length === PAGE_SIZE);
		} catch (err) {
			console.error('Failed to load goals:', err);
			setError('Не удалось загрузить цели');
		} finally {
			setIsLoading(false);
		}
	}, [page, serverFilter]);

	useEffect(() => {
		loadGoals();
	}, [loadGoals]);

	// Filter goals
	useEffect(() => {
		let filtered = [...goals];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((goal) => {
				const name = goal.name.toLowerCase();
				const resourceType = goal.resourceType.toLowerCase();
				return name.includes(query) || resourceType.includes(query);
			});
		}

		setFilteredGoals(filtered);
	}, [goals, searchQuery]);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (page !== 1) {
			setPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, serverFilter]);

	const handleDeleteGoal = async () => {
		if (!deletingGoal) return;

		try {
			await resourceCollectionService.deleteGoal(deletingGoal.id);
			await loadGoals();
			setDeletingGoal(null);
		} catch (err) {
			console.error('Failed to delete goal:', err);
			alert('Не удалось удалить цель');
		}
	};

	const handleCreateSuccess = () => {
		setShowCreateForm(false);
		loadGoals();
	};

	const handleEditSuccess = () => {
		setEditingGoal(null);
		loadGoals();
	};

	const getServerName = (serverId: string): string => {
		const server = servers.find((s) => String(s.id) === serverId);
		if (!server) return serverId;
		return typeof server.name === 'string' ? server.name : 'Без названия';
	};

	if (isLoading && goals.length === 0) {
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
							placeholder="Поиск по названию или типу ресурса..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Server Filter */}
					<div className="flex items-center gap-2">
						<label className="text-sm text-white/60 whitespace-nowrap">Сервер:</label>
						<select
							value={serverFilter}
							onChange={(e) => setServerFilter(e.target.value)}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="all">Все серверы</option>
							{servers.map((server) => {
								const serverId = String(server.id);
								const serverName = typeof server.name === 'string' ? server.name : 'Без названия';
								return (
									<option key={serverId} value={serverId}>
										{serverName}
									</option>
								);
							})}
						</select>
					</div>

					{/* Create Button */}
					<Button onClick={() => setShowCreateForm(true)}>Создать цель</Button>
				</div>
			</div>

			{/* Error */}
			{error && (
				<div className="glass-card bg-red-500/20 border border-red-500/50 p-4 mb-6">
					<p className="text-red-400">{error}</p>
				</div>
			)}

			{/* Goals Grid */}
			{filteredGoals.length === 0 && !isLoading ? (
				<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
					<p className="text-white/60">
						{searchQuery || serverFilter !== 'all' ? 'Цели не найдены' : 'Цели не созданы'}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredGoals.map((goal) => {
							const isActive = goal.isActive !== false;

							return (
								<div
									key={goal.id}
									className={`glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 rounded-lg ${
										!isActive ? 'opacity-60' : ''
									}`}
								>
									<div className="mb-4">
										<div className="flex items-start justify-between mb-2">
											<h3 className="text-lg font-bold text-white truncate flex-1">{goal.name}</h3>
											<div className="flex items-center gap-2 ml-2">
												{!isActive && (
													<span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs">
														Неактивна
													</span>
												)}
											</div>
										</div>
										<div className="text-xs text-white/60 space-y-1">
											<div>
												Сервер:{' '}
												<span className="text-white/80">{getServerName(goal.serverId)}</span>
											</div>
											<div>
												Тип ресурса:{' '}
												<span className="text-white/80 capitalize">{goal.resourceType}</span>
											</div>
											<div>
												Целевое количество:{' '}
												<span className="text-white/80">
													{goal.targetAmount.toLocaleString('ru-RU')}
												</span>
											</div>
										</div>
									</div>

									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setEditingGoal(goal)}
											className="flex-1"
										>
											Редактировать
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => setDeletingGoal(goal)}
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
				<GoalCreateForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
			)}

			{/* Edit Modal */}
			{editingGoal && (
				<GoalEditModal
					goal={editingGoal}
					onSuccess={handleEditSuccess}
					onCancel={() => setEditingGoal(null)}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmationModal
				isOpen={!!deletingGoal}
				onClose={() => setDeletingGoal(null)}
				onConfirm={handleDeleteGoal}
				title="Удалить цель?"
				message={`Вы уверены, что хотите удалить цель "${deletingGoal?.name}"? Это действие не может быть отменено.`}
				confirmText="Удалить"
				cancelText="Отмена"
				isDangerous={true}
			/>
		</>
	);
}
