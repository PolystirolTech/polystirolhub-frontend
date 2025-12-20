'use client';

/**
 * Goal Edit Modal
 *
 * Modal for editing resource collection goals
 */

import { useState, useEffect } from 'react';
import { resourceCollectionService } from '@/lib/resource-collection';
import { gameService } from '@/lib/game/game-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ResourceGoal } from '@/lib/resource-collection';
import type { GameServerResponse } from '@/lib/api/generated';

interface GoalEditModalProps {
	goal: ResourceGoal;
	onSuccess: () => void;
	onCancel: () => void;
}

export function GoalEditModal({ goal, onSuccess, onCancel }: GoalEditModalProps) {
	const [serverId, setServerId] = useState(goal.serverId);
	const [name, setName] = useState(goal.name);
	const [resourceType, setResourceType] = useState(goal.resourceType);
	const [targetAmount, setTargetAmount] = useState<number | ''>(goal.targetAmount);
	const [isActive, setIsActive] = useState(goal.isActive);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [servers, setServers] = useState<GameServerResponse[]>([]);
	const [isLoadingServers, setIsLoadingServers] = useState(true);

	useEffect(() => {
		async function loadServers() {
			try {
				const serverList = await gameService.getAdminGameServers();
				setServers(serverList);
			} catch (err) {
				console.error('Failed to load servers:', err);
			} finally {
				setIsLoadingServers(false);
			}
		}
		loadServers();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (name.trim() && name.trim().length === 0) {
			setError('Название не может быть пустым');
			return;
		}

		if (resourceType.trim() && resourceType.trim().length === 0) {
			setError('Тип ресурса не может быть пустым');
			return;
		}

		if (targetAmount !== '' && targetAmount !== undefined && targetAmount < 0) {
			setError('Целевое количество должно быть >= 0');
			return;
		}

		// Проверка уникальности при изменении serverId или resourceType
		if (
			(serverId !== goal.serverId || resourceType !== goal.resourceType) &&
			serverId &&
			resourceType
		) {
			try {
				const existingGoals = await resourceCollectionService.getGoals(serverId);
				const duplicate = existingGoals.find(
					(g) =>
						g.id !== goal.id &&
						g.resourceType.toLowerCase() === resourceType.toLowerCase().trim() &&
						g.isActive
				);
				if (duplicate) {
					setError(
						`Цель для типа ресурса "${resourceType}" уже существует на этом сервере. Выберите другой тип ресурса или сервер.`
					);
					return;
				}
			} catch (err) {
				console.error('Failed to check uniqueness:', err);
				// Продолжаем, если проверка не удалась
			}
		}

		try {
			setIsSubmitting(true);
			await resourceCollectionService.updateGoal(goal.id, {
				serverId: serverId !== goal.serverId ? serverId : undefined,
				name: name !== goal.name ? name.trim() : undefined,
				resourceType: resourceType !== goal.resourceType ? resourceType.trim() : undefined,
				targetAmount: targetAmount !== goal.targetAmount ? Number(targetAmount) : undefined,
				isActive: isActive !== goal.isActive ? isActive : undefined,
			});
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to update goal:', err);
			setError(err instanceof Error ? err.message : 'Не удалось обновить цель');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className="glass-card bg-[var(--color-secondary)] relative max-w-2xl w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
				<h2 className="mb-4 text-2xl font-bold text-white">Редактировать цель</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Server */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Сервер</label>
						{isLoadingServers ? (
							<div className="h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 flex items-center">
								<span className="text-sm text-white/60">Загрузка серверов...</span>
							</div>
						) : (
							<select
								value={serverId}
								onChange={(e) => setServerId(e.target.value)}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							>
								{servers.map((server) => {
									const id = String(server.id);
									const name = typeof server.name === 'string' ? server.name : 'Без названия';
									return (
										<option key={id} value={id}>
											{name}
										</option>
									);
								})}
							</select>
						)}
					</div>

					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Название цели</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Например: Собрать 1000 дерева"
						/>
					</div>

					{/* Resource Type */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Тип ресурса</label>
						<Input
							type="text"
							value={resourceType}
							onChange={(e) => setResourceType(e.target.value)}
							placeholder="Например: wood, stone, iron"
						/>
					</div>

					{/* Target Amount */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Целевое количество
						</label>
						<Input
							type="number"
							value={targetAmount}
							onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="Например: 1000"
							min="0"
						/>
					</div>

					{/* Is Active */}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="isActive"
							checked={isActive}
							onChange={(e) => setIsActive(e.target.checked)}
							className="h-4 w-4 rounded border-input bg-background/50 text-primary focus:ring-2 focus:ring-ring"
						/>
						<label htmlFor="isActive" className="text-sm font-medium text-white/90">
							Активна
						</label>
					</div>

					{/* Error */}
					{error && (
						<div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-400">
							{error}
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-3 justify-end pt-4">
						<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
							Отмена
						</Button>
						<Button type="submit" disabled={isSubmitting || isLoadingServers}>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
