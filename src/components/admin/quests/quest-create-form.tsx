'use client';

/**
 * Quest Create Form
 *
 * Form for creating new quests
 */

import { useState } from 'react';
import { questService } from '@/lib/quests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuestCreateFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

export function QuestCreateForm({ onSuccess, onCancel }: QuestCreateFormProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [questType, setQuestType] = useState<'daily' | 'achievement'>('daily');
	const [conditionKey, setConditionKey] = useState('');
	const [targetValue, setTargetValue] = useState<number | ''>('');
	const [rewardXp, setRewardXp] = useState<number | ''>('');
	const [rewardBalance, setRewardBalance] = useState<number | ''>('');
	const [isActive, setIsActive] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError('Название обязательно');
			return;
		}

		if (!conditionKey.trim()) {
			setError('Ключ условия обязателен');
			return;
		}

		if (targetValue === '' || targetValue === undefined) {
			setError('Целевое значение обязательно');
			return;
		}

		try {
			setIsSubmitting(true);
			await questService.createQuest({
				name: name.trim(),
				description: description.trim() || undefined,
				questType,
				conditionKey: conditionKey.trim(),
				targetValue: Number(targetValue),
				rewardXp: rewardXp !== '' ? Number(rewardXp) : undefined,
				rewardBalance: rewardBalance !== '' ? Number(rewardBalance) : undefined,
				isActive,
			});
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to create quest:', err);
			setError(err instanceof Error ? err.message : 'Не удалось создать квест');
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
				<h2 className="mb-4 text-2xl font-bold text-white">Создать квест</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Название <span className="text-red-400">*</span>
						</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Введите название квеста"
							required
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
						<label className="block text-sm font-medium text-white/90 mb-2">
							Тип квеста <span className="text-red-400">*</span>
						</label>
						<select
							value={questType}
							onChange={(e) => setQuestType(e.target.value as 'daily' | 'achievement')}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							required
						>
							<option value="daily">Ежедневный</option>
							<option value="achievement">Достижение</option>
						</select>
					</div>

					{/* Condition Key */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Ключ условия <span className="text-red-400">*</span>
						</label>
						<Input
							type="text"
							value={conditionKey}
							onChange={(e) => setConditionKey(e.target.value)}
							placeholder="Например: playtime_daily, server_join_daily"
							required
						/>
						<p className="mt-1 text-xs text-white/60">
							Ключ условия определяет, какое событие отслеживается для выполнения квеста
						</p>
					</div>

					{/* Target Value */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Целевое значение <span className="text-red-400">*</span>
						</label>
						<Input
							type="number"
							value={targetValue}
							onChange={(e) => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="Например: 3600 (для времени в секундах)"
							required
							min="1"
						/>
						<p className="mt-1 text-xs text-white/60">
							Значение, которое нужно достичь для выполнения квеста
						</p>
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
							{isSubmitting ? 'Создание...' : 'Создать'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
