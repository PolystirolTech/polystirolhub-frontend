/**
 * Badge Types and Utilities
 *
 * Types and helper functions for working with badges
 */

import type { Badge, UserBadgeWithBadge } from '@/lib/api/generated';

/**
 * Badge type values
 */
export type BadgeTypeValue = 'temporary' | 'event' | 'permanent';

/**
 * Extended Badge interface with proper typing
 */
export interface BadgeExtended extends Omit<Badge, 'badgeType'> {
	badgeType: BadgeTypeValue;
}

/**
 * Extended UserBadgeWithBadge with proper typing
 */
export interface UserBadgeWithBadgeExtended extends Omit<
	UserBadgeWithBadge,
	'badge' | 'expiresAt'
> {
	badge: BadgeExtended;
	expiresAt?: string | null;
	receivedAt: string;
}

/**
 * Badge type configuration
 */
export interface BadgeTypeConfig {
	label: string;
	color: string;
	bgColor: string;
	icon: string;
}

/**
 * Badge type configurations
 */
export const BADGE_TYPE_CONFIGS: Record<BadgeTypeValue, BadgeTypeConfig> = {
	temporary: {
		label: 'Временный',
		color: 'text-orange-400',
		bgColor: 'bg-orange-500/20',
		icon: '⏰',
	},
	event: {
		label: 'Ивентовый',
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/20',
		icon: '🎉',
	},
	permanent: {
		label: 'Постоянный',
		color: 'text-green-400',
		bgColor: 'bg-green-500/20',
		icon: '⭐',
	},
};

/**
 * Get badge type config
 */
export function getBadgeTypeConfig(type: BadgeTypeValue | string | undefined): BadgeTypeConfig {
	if (!type || !(type in BADGE_TYPE_CONFIGS)) {
		return BADGE_TYPE_CONFIGS.permanent;
	}
	return BADGE_TYPE_CONFIGS[type as BadgeTypeValue];
}

/**
 * Check if badge is expired
 */
export function isBadgeExpired(expiresAt: string | null | undefined): boolean {
	if (!expiresAt) return false;
	return new Date(expiresAt) < new Date();
}

/**
 * Check if badge expires soon (within 7 days)
 */
export function isBadgeExpiringSoon(expiresAt: string | null | undefined): boolean {
	if (!expiresAt) return false;
	const expiryDate = new Date(expiresAt);
	const now = new Date();
	const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
	return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
}

/**
 * Format date for display
 */
export function formatBadgeDate(dateString: string | null | undefined): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

/**
 * Format datetime for display
 */
export function formatBadgeDateTime(dateString: string | null | undefined): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
	const maxSize = 5 * 1024 * 1024; // 5MB
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: 'Файл должен быть в формате JPEG, PNG или WebP',
		};
	}

	if (file.size > maxSize) {
		return {
			valid: false,
			error: 'Размер файла не должен превышать 5MB',
		};
	}

	return { valid: true };
}
