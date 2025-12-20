'use client';

/**
 * Goal Create Form
 *
 * Form for creating new resource collection goals
 */

import { useState, useEffect } from 'react';
import { resourceCollectionService } from '@/lib/resource-collection';
import { gameService } from '@/lib/game/game-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GameServerResponse } from '@/lib/api/generated';

interface GoalCreateFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

export function GoalCreateForm({ onSuccess, onCancel }: GoalCreateFormProps) {
	const [serverId, setServerId] = useState('');
	const [name, setName] = useState('');
	const [resourceType, setResourceType] = useState('');
	const [targetAmount, setTargetAmount] = useState<number | ''>('');
	const [isActive, setIsActive] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [servers, setServers] = useState<GameServerResponse[]>([]);
	const [isLoadingServers, setIsLoadingServers] = useState(true);

	useEffect(() => {
		async function loadServers() {
			try {
				const serverList = await gameService.getAdminGameServers();
				setServers(serverList);
				if (serverList.length > 0 && !serverId) {
					setServerId(String(serverList[0].id));
				}
			} catch (err) {
				console.error('Failed to load servers:', err);
			} finally {
				setIsLoadingServers(false);
			}
		}
		loadServers();
	}, [serverId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!serverId.trim()) {
			setError('Сервер обязателен');
			return;
		}

		if (!name.trim()) {
			setError('Название обязательно');
			return;
		}

		if (!resourceType.trim()) {
			setError('Тип ресурса обязателен');
			return;
		}

		if (targetAmount === '' || targetAmount === undefined || targetAmount < 0) {
			setError('Целевое количество обязательно и должно быть >= 0');
			return;
		}

		// Проверка уникальности перед отправкой
		try {
			const existingGoals = await resourceCollectionService.getGoals(serverId);
			const duplicate = existingGoals.find(
				(g) => g.resourceType.toLowerCase() === resourceType.toLowerCase().trim() && g.isActive
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

		try {
			setIsSubmitting(true);
			await resourceCollectionService.createGoal({
				serverId: serverId.trim(),
				name: name.trim(),
				resourceType: resourceType.trim(),
				targetAmount: Number(targetAmount),
				isActive,
			});
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to create goal:', err);
			setError(err instanceof Error ? err.message : 'Не удалось создать цель');
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
				<h2 className="mb-4 text-2xl font-bold text-white">Создать цель сбора ресурсов</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Server */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Сервер <span className="text-red-400">*</span>
						</label>
						{isLoadingServers ? (
							<div className="h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 flex items-center">
								<span className="text-sm text-white/60">Загрузка серверов...</span>
							</div>
						) : (
							<select
								value={serverId}
								onChange={(e) => setServerId(e.target.value)}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
								required
							>
								<option value="">Выберите сервер</option>
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
						<label className="block text-sm font-medium text-white/90 mb-2">
							Название цели <span className="text-red-400">*</span>
						</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Например: Собрать 1000 дерева"
							required
						/>
					</div>

					{/* Resource Type */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Тип ресурса <span className="text-red-400">*</span>
						</label>
						<Input
							type="text"
							value={resourceType}
							onChange={(e) => setResourceType(e.target.value)}
							placeholder="Например: wood, stone, iron"
							required
						/>
						<p className="mt-1 text-xs text-white/60">
							Тип ресурса определяет, какой ресурс отслеживается (например, &quot;wood&quot;,
							&quot;stone&quot;, &quot;iron&quot;)
						</p>
					</div>

					{/* Target Amount */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Целевое количество <span className="text-red-400">*</span>
						</label>
						<Input
							type="number"
							value={targetAmount}
							onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="Например: 1000"
							required
							min="0"
						/>
						<p className="mt-1 text-xs text-white/60">
							Количество ресурса, которое нужно собрать для достижения цели
						</p>
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
							{isSubmitting ? 'Создание...' : 'Создать'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
