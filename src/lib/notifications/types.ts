/**
 * Notification Types
 *
 * Типы для метаданных уведомлений
 */

import type { NotificationResponse } from '@/lib/api';

/**
 * Метаданные для уведомления level_up
 */
export interface LevelUpMetaData {
	old_level: number;
	new_level: number;
	levels_gained: number;
}

/**
 * Метаданные для уведомления achievement_unlocked
 */
export interface AchievementUnlockedMetaData {
	quest_id: string;
	quest_name: string;
}

/**
 * Метаданные для уведомления badge_earned
 */
export interface BadgeEarnedMetaData {
	badge_id: string;
	badge_name: string;
}

/**
 * Типы уведомлений
 */
export type NotificationType = 'level_up' | 'achievement_unlocked' | 'badge_earned';

/**
 * Расширенный тип уведомления с типизированными метаданными
 */
export interface TypedNotification extends NotificationResponse {
	notificationType: NotificationType;
	metaData?: LevelUpMetaData | AchievementUnlockedMetaData | BadgeEarnedMetaData;
}
