/**
 * Quest Formatting Utilities
 *
 * Utility functions for formatting quest data
 */

import type { UserQuestWithQuest } from '@/lib/api/generated/models/UserQuestWithQuest';

/**
 * Get display data for a quest (progress, target, percent)
 * Handles logic where completed quests should show 100% even if progress is 0
 */
export function getQuestDisplayData(userQuest: UserQuestWithQuest) {
	const quest = userQuest.quest;
	const rawProgress = userQuest.progress ?? 0;
	const targetValue = quest.targetValue ?? 1;
	const isCompleted = isQuestCompleted(userQuest.completedAt);

	// If completed but progress is less than target (e.g. 0), show target value
	// If progress is greater than target (over-completion), show actual progress
	const displayProgress =
		isCompleted && rawProgress < targetValue ? targetValue : rawProgress;

	const percent =
		targetValue > 0 ? Math.min(100, (displayProgress / targetValue) * 100) : 0;

	return {
		progress: displayProgress,
		targetValue,
		percent,
		isCompleted,
	};
}

/**
 * Format quest progress as percentage
 */
export function formatQuestProgress(
	progress: number | null | undefined,
	targetValue: number | null | undefined
): string {
	if (!progress || !targetValue || targetValue === 0) return '0%';
	const percent = Math.min(100, Math.round((progress / targetValue) * 100));
	return `${percent}%`;
}

/**
 * Format playtime from seconds to readable format (hours/minutes)
 * For playtime_daily quests where progress and targetValue are in seconds
 */
export function formatPlaytimeSeconds(seconds: number | null | undefined): string {
	if (!seconds || seconds <= 0) return '0м';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}ч ${minutes}м`;
	} else if (minutes > 0) {
		return `${minutes}м`;
	} else {
		return `${seconds}с`;
	}
}

/**
 * Check if quest is completed
 */
export function isQuestCompleted(completedAt: unknown | null | undefined): boolean {
	return completedAt !== null && completedAt !== undefined;
}

/**
 * Format quest reward text
 */
export function getQuestRewardText(rewardXp: number | null | undefined): string {
	if (!rewardXp || rewardXp === 0) return '';
	return `${rewardXp} XP`;
}

/**
 * Format quest name (handle any type)
 */
export function formatQuestName(name: string | number | null | undefined): string {
	if (typeof name === 'string') return name;
	if (name === null || name === undefined) return 'Без названия';
	return String(name);
}

/**
 * Format quest description (handle Description type)
 */
export function formatQuestDescription(description: unknown | null | undefined): string {
	if (typeof description === 'string') return description;
	if (description === null || description === undefined) return '';
	if (typeof description === 'object' && description !== null && 'value' in description) {
		return String((description as { value?: unknown }).value || '');
	}
	return String(description || '');
}
