/**
 * Notification Utilities
 *
 * Утилиты для форматирования уведомлений
 */

import type { NotificationResponse } from '@/lib/api';

/**
 * Форматирование относительного времени для уведомлений
 */
export function formatNotificationTime(createdAt: string | null | undefined): string {
	if (!createdAt) return 'Неизвестно';

	const date = new Date(createdAt);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'только что';
	if (diffMins < 60) {
		const minutes = pluralize(diffMins, 'минуту', 'минуты', 'минут');
		return `${diffMins} ${minutes} назад`;
	}
	if (diffHours < 24) {
		const hours = pluralize(diffHours, 'час', 'часа', 'часов');
		return `${diffHours} ${hours} назад`;
	}
	if (diffDays === 1) return 'вчера';
	if (diffDays < 7) {
		const days = pluralize(diffDays, 'день', 'дня', 'дней');
		return `${diffDays} ${days} назад`;
	}

	// Для старых уведомлений показываем полную дату
	return date.toLocaleString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Склонение слов в зависимости от числа
 */
function pluralize(count: number, one: string, few: string, many: string): string {
	const mod10 = count % 10;
	const mod100 = count % 100;

	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
	return many;
}

/**
 * Получить иконку для типа уведомления
 */
export function getNotificationIcon(type: string | null | undefined): string {
	switch (type) {
		case 'level_up':
			return '⭐';
		case 'achievement_unlocked':
			return '🏆';
		case 'badge_earned':
			return '🎖️';
		default:
			return '📢';
	}
}

/**
 * Форматирование текста наград
 */
export function formatRewardText(rewardXp?: number | null, rewardBalance?: number | null): string {
	const parts: string[] = [];

	if (rewardXp && rewardXp > 0) {
		parts.push(`+${rewardXp} XP`);
	}

	if (rewardBalance && rewardBalance > 0) {
		parts.push(`+${rewardBalance} монет`);
	}

	return parts.join(', ');
}

/**
 * Форматирование сообщения уведомления с учетом типа и метаданных
 */
export function formatNotificationMessage(notification: NotificationResponse): string {
	const { notificationType, title, message, metaData } = notification;

	// Если есть готовое сообщение, используем его
	// message может быть объектом или строкой
	if (message) {
		if (typeof message === 'object') {
			// Проверяем различные возможные поля
			const msgObj = message as Record<string, unknown>;
			if (msgObj.message && typeof msgObj.message === 'string') {
				return msgObj.message;
			}
			if (msgObj.text && typeof msgObj.text === 'string') {
				return msgObj.text;
			}
		}
		if (typeof message === 'string' && message) {
			return message;
		}
	}

	// Если есть title, используем его
	if (title && typeof title === 'string') {
		return title;
	}

	// Иначе формируем сообщение на основе типа и метаданных
	if (metaData && typeof metaData === 'object') {
		const meta = metaData as Record<string, unknown>;

		switch (notificationType) {
			case 'level_up': {
				if (meta.old_level !== undefined && meta.new_level !== undefined) {
					return `Повышение уровня: ${meta.old_level} → ${meta.new_level}`;
				}
				break;
			}

			case 'achievement_unlocked': {
				if (meta.quest_name) {
					return `Достижение разблокировано: ${meta.quest_name}`;
				}
				break;
			}

			case 'badge_earned': {
				if (meta.badge_name) {
					return `Получен бадж: ${meta.badge_name}`;
				}
				break;
			}
		}
	}

	// Фолбэк сообщения по типу
	switch (notificationType) {
		case 'level_up':
			return 'Новый уровень получен!';
		case 'achievement_unlocked':
			return 'Новое достижение!';
		case 'badge_earned':
			return 'Новый бадж получен!';
		default:
			return 'Новое уведомление';
	}
}
