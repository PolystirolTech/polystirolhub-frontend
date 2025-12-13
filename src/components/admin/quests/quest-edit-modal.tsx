'use client';

/**
 * Quest Edit Modal
 *
 * Modal for editing existing quests
 */

import { useState, useEffect } from 'react';
import { questService } from '@/lib/quests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Quest } from '@/lib/quests';
import { formatQuestName, formatQuestDescription } from '@/lib/utils/quest-formatters';

type QuestWithRewardBalance = Quest & {
	rewardBalance?: number | null;
};

interface QuestEditModalProps {
	quest: QuestWithRewardBalance;
	onSuccess: () => void;
	onCancel: () => void;
}

export function QuestEditModal({ quest, onSuccess, onCancel }: QuestEditModalProps) {
	const [name, setName] = useState(formatQuestName(quest.name));
	const [description, setDescription] = useState(formatQuestDescription(quest.description));
	const [questType, setQuestType] = useState<string>(String(quest.questType || 'daily'));
	const [conditionKey, setConditionKey] = useState(String(quest.conditionKey || ''));
	const [targetValue, setTargetValue] = useState<number | ''>(
		quest.targetValue !== null && quest.targetValue !== undefined ? Number(quest.targetValue) : ''
	);
	const [rewardXp, setRewardXp] = useState<number | ''>(
		quest.rewardXp !== null && quest.rewardXp !== undefined ? Number(quest.rewardXp) : ''
	);
	const [rewardBalance, setRewardBalance] = useState<number | ''>(
		quest.rewardBalance !== null && quest.rewardBalance !== undefined
			? Number(quest.rewardBalance)
			: ''
	);
	const [isActive, setIsActive] = useState(quest.isActive !== false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setName(formatQuestName(quest.name));
		setDescription(formatQuestDescription(quest.description));
		setQuestType(String(quest.questType || 'daily'));
		setConditionKey(String(quest.conditionKey || ''));
		setTargetValue(
			quest.targetValue !== null && quest.targetValue !== undefined ? Number(quest.targetValue) : ''
		);
		setRewardXp(
			quest.rewardXp !== null && quest.rewardXp !== undefined ? Number(quest.rewardXp) : ''
		);
		setRewardBalance(
			quest.rewardBalance !== null && quest.rewardBalance !== undefined
				? Number(quest.rewardBalance)
				: ''
		);
		setIsActive(quest.isActive !== false);
	}, [quest]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const updateData: {
			name?: string;
			description?: string;
			questType?: string;
			conditionKey?: string;
			targetValue?: number;
			rewardXp?: number;
			rewardBalance?: number;
			isActive?: boolean;
		} = {};

		const currentName = formatQuestName(quest.name);
		if (name.trim() !== currentName) {
			updateData.name = name.trim();
		}

		const currentDescription = formatQuestDescription(quest.description);
		if (description.trim() !== currentDescription) {
			updateData.description = description.trim() || undefined;
		}

		const currentQuestType = String(quest.questType || '');
		if (questType !== currentQuestType) {
			updateData.questType = questType;
		}

		const currentConditionKey = String(quest.conditionKey || '');
		if (conditionKey.trim() !== currentConditionKey) {
			updateData.conditionKey = conditionKey.trim();
		}

		const currentTargetValue =
			quest.targetValue !== null && quest.targetValue !== undefined
				? Number(quest.targetValue)
				: '';
		if (targetValue !== currentTargetValue) {
			updateData.targetValue = targetValue !== '' ? Number(targetValue) : undefined;
		}

		const currentRewardXp =
			quest.rewardXp !== null && quest.rewardXp !== undefined ? Number(quest.rewardXp) : '';
		if (rewardXp !== currentRewardXp) {
			updateData.rewardXp = rewardXp !== '' ? Number(rewardXp) : undefined;
		}

		const currentRewardBalance =
			quest.rewardBalance !== null && quest.rewardBalance !== undefined
				? Number(quest.rewardBalance)
				: '';
		if (rewardBalance !== currentRewardBalance) {
			updateData.rewardBalance = rewardBalance !== '' ? Number(rewardBalance) : undefined;
		}

		const currentIsActive = quest.isActive !== false;
		if (isActive !== currentIsActive) {
			updateData.isActive = isActive;
		}

		// Only update if there are changes
		if (Object.keys(updateData).length === 0) {
			onSuccess();
			return;
		}

		try {
			setIsSubmitting(true);
			await questService.updateQuest(String(quest.id || ''), updateData);
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to update quest:', err);
			setError(err instanceof Error ? err.message : 'Не удалось обновить квест');
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
				<h2 className="mb-4 text-2xl font-bold text-white">Редактировать квест</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Название</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Введите название квеста"
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Описание</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Введите описание квеста"
							className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm resize-none"
							rows={3}
						/>
					</div>

					{/* Quest Type */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Тип квеста</label>
						<select
							value={questType}
							onChange={(e) => setQuestType(e.target.value)}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="daily">Ежедневный</option>
							<option value="achievement">Достижение</option>
						</select>
					</div>

					{/* Condition Key */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Ключ условия</label>
						<Input
							type="text"
							value={conditionKey}
							onChange={(e) => setConditionKey(e.target.value)}
							placeholder="Например: playtime_daily, server_join_daily"
						/>
					</div>

					{/* Target Value */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Целевое значение</label>
						<Input
							type="number"
							value={targetValue}
							onChange={(e) => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="Например: 3600 (для времени в секундах)"
							min="1"
						/>
					</div>

					{/* Reward XP */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Награда XP</label>
						<Input
							type="number"
							value={rewardXp}
							onChange={(e) => setRewardXp(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="0"
							min="0"
						/>
					</div>

					{/* Reward Balance */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Награда в валюте</label>
						<Input
							type="number"
							value={rewardBalance}
							onChange={(e) =>
								setRewardBalance(e.target.value === '' ? '' : Number(e.target.value))
							}
							placeholder="0"
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
							Активен
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
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
