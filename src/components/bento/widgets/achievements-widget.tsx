'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { questService } from '@/lib/quests';
import type { UserQuestWithQuest } from '@/lib/quests';
import {
	formatQuestName,
	isQuestCompleted,
	formatQuestProgress,
	getQuestDisplayData,
} from '@/lib/utils/quest-formatters';

export function AchievementsWidget() {
	const { isAuthenticated } = useAuth();
	const [achievements, setAchievements] = useState<UserQuestWithQuest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadAchievements = useCallback(async () => {
		if (!isAuthenticated) {
			setIsLoading(false);
			return;
		}

		try {
			setError(null);
			const data = await questService.getMyQuests(0, 20);
			// Filter only achievement quests
			const achievementQuests = data.filter(
				(userQuest) =>
					userQuest.quest.questType === 'achievement' ||
					String(userQuest.quest.questType) === 'achievement'
			);
			setAchievements(achievementQuests);
		} catch (err) {
			console.error('Failed to load achievements:', err);
			setError('Не удалось загрузить достижения');
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		loadAchievements();

		if (!isAuthenticated) {
			return;
		}

		// Auto-refresh every 45 seconds
		const interval = setInterval(() => {
			loadAchievements();
		}, 45000);

		return () => clearInterval(interval);
	}, [isAuthenticated, loadAchievements]);

	if (!isAuthenticated) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
				<p className="text-xs text-white/60">Войдите для просмотра достижений</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
				<p className="text-xs text-white/60">{error}</p>
			</div>
		);
	}

	// Filter uncompleted achievements and sort by progress (nearest to unlock)
	const uncompletedAchievements = achievements
		.filter((a) => !isQuestCompleted(a.completedAt))
		.sort((a, b) => {
			const { percent: percentA } = getQuestDisplayData(a);
			const { percent: percentB } = getQuestDisplayData(b);
			return percentB - percentA;
		})
		.slice(0, 3);

	if (uncompletedAchievements.length === 0) {
		// Check if all achievements are completed
		const hasCompleted = achievements.some((a) => isQuestCompleted(a.completedAt));
		if (hasCompleted) {
			return (
				<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
					<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
					<p className="text-xs text-white/40">Все достижения разблокированы!</p>
				</div>
			);
		}
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
				<p className="text-xs text-white/60">Нет активных достижений</p>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
			<div className="space-y-2 mb-3">
				{uncompletedAchievements.map((userQuest) => {
					const quest = userQuest.quest;
					const {
						progress,
						targetValue,
						percent: progressPercent,
					} = getQuestDisplayData(userQuest);
					const questName = formatQuestName(quest.name);
					const progressText = formatQuestProgress(progress, targetValue);

					return (
						<div key={userQuest.id} className="rounded-lg bg-white/5 p-2">
							<div className="mb-1 flex items-center gap-2">
								<div className="text-lg">🏆</div>
								<span className="flex-1 text-xs font-medium text-white">{questName}</span>
								<span className="text-xs text-white/60">{progressText}</span>
							</div>
							<div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
								<div
									className="h-full bg-primary transition-all"
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
			<Link
				href="/profile/achievements"
				className="text-xs text-primary hover:text-primary/80 transition-colors underline block text-center"
			>
				Посмотреть все достижения →
			</Link>
		</div>
	);
}
