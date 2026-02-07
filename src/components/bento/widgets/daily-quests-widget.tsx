'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { questService } from '@/lib/quests';
import type { UserQuestWithQuest } from '@/lib/quests';
import {
	formatQuestName,
	getQuestRewardText,
	formatPlaytimeSeconds,
	getQuestDisplayData,
} from '@/lib/utils/quest-formatters';

export function DailyQuestsWidget() {
	const { isAuthenticated } = useAuth();
	const [quests, setQuests] = useState<UserQuestWithQuest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadQuests = useCallback(async () => {
		if (!isAuthenticated) {
			setIsLoading(false);
			return;
		}

		try {
			setError(null);
			const data = await questService.getMyQuests(0, 20);
			// Filter only daily quests
			const dailyQuests = data.filter(
				(userQuest) =>
					userQuest.quest.questType === 'daily' || String(userQuest.quest.questType) === 'daily'
			);
			setQuests(dailyQuests);
		} catch (err) {
			console.error('Failed to load daily quests:', err);
			setError('Не удалось загрузить квесты');
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		loadQuests();

		if (!isAuthenticated) {
			return;
		}

		// Auto-refresh every 45 seconds
		const interval = setInterval(() => {
			loadQuests();
		}, 45000);

		return () => clearInterval(interval);
	}, [isAuthenticated, loadQuests]);

	if (!isAuthenticated) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
				<p className="text-xs text-white/60">Войдите для просмотра квестов</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
				<p className="text-xs text-white/60">{error}</p>
			</div>
		);
	}

	if (quests.length === 0) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
				<p className="text-xs text-white/60">Нет активных ежедневных квестов</p>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
			<div className="space-y-3">
				{quests.map((userQuest) => {
					const quest = userQuest.quest;
					const {
						progress,
						targetValue,
						percent: progressPercent,
						isCompleted,
					} = getQuestDisplayData(userQuest);
					const questName = formatQuestName(quest.name);
					const rewardText = getQuestRewardText(quest.rewardXp);

					// Format playtime for playtime_daily condition
					let progressText = `${progress} / ${targetValue}`;
					if (
						quest.conditionKey === 'playtime_daily' ||
						String(quest.conditionKey) === 'playtime_daily'
					) {
						progressText = `${formatPlaytimeSeconds(progress)} / ${formatPlaytimeSeconds(targetValue)}`;
					}

					return (
						<div
							key={userQuest.id}
							className={`rounded-lg bg-white/5 p-2 ${isCompleted ? 'opacity-75' : ''}`}
						>
							<div className="mb-1 flex items-center justify-between">
								<span className="text-xs font-medium text-white">{questName}</span>
								{rewardText && <span className="text-xs text-white/60">{rewardText}</span>}
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
								<div
									className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
							<p className="mt-1 text-xs text-white/40">{progressText}</p>
							{isCompleted && (
								<p className="mt-1 text-xs text-green-400 font-medium">✓ Завершено</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
