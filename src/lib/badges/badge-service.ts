/**
 * Badge Service
 *
 * Service layer for working with badges API
 */

import {
	BadgesApi,
	apiConfig,
	type Badge,
	type UserBadgeWithBadge,
	type AwardBadgeRequest,
} from '@/lib/api';
import { UserBadgeWithBadgeFromJSON } from '@/lib/api/generated/models/UserBadgeWithBadge';
import { BadgeFromJSON } from '@/lib/api/generated/models/Badge';
import { ExpiresAtFromJSON } from '@/lib/api/generated/models/ExpiresAt';
import type { BadgeTypeValue } from './types';

export interface BadgeCondition {
	key: string;
	name: string;
	description: string;
	type: 'periodic' | 'event';
	requiresTargetValue: boolean;
	requiresAutoCheck: boolean;
	implementationStatus: string;
}

class BadgeService {
	private badgesApi: BadgesApi;

	constructor() {
		this.badgesApi = new BadgesApi(apiConfig);
	}

	/**
	 * Get all public badges
	 */
	async getAllBadges(skip: number = 0, limit: number = 50): Promise<Badge[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/badges${params.toString() ? `?${params.toString()}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении бэджиков' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении бэджиков');
		}

		const data = await response.json();
		return Array.isArray(data) ? data : [];
	}

	/**
	 * Get badge by ID (public)
	 */
	async getBadge(badgeId: string): Promise<Badge> {
		return await this.badgesApi.getBadgeApiV1BadgesBadgeIdGet({ badgeId });
	}

	/**
	 * Get user's badges
	 * Uses fetch directly to ensure cookies are sent correctly
	 * Maps snake_case to camelCase for proper type compatibility
	 */
	async getMyBadges(skip: number = 0, limit: number = 50): Promise<UserBadgeWithBadge[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/badges/me${params.toString() ? `?${params.toString()}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении бэджиков' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении бэджиков');
		}

		const data = await response.json();
		if (!Array.isArray(data)) return [];

		// Use generated mapper to convert snake_case to camelCase
		return data.map((item: unknown) => UserBadgeWithBadgeFromJSON(item));
	}

	/**
	 * Select badge for display
	 * Uses fetch directly to ensure cookies are sent correctly
	 */
	async selectBadge(badgeId: string): Promise<void> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(
			`${basePath}/api/v1/badges/me/select?badge_id=${encodeURIComponent(badgeId)}`,
			{
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при выборе бэйджа' }));
			throw new Error(error.message || error.detail || 'Ошибка при выборе бэйджа');
		}
	}

	/**
	 * Deselect badge
	 * Uses fetch directly to ensure cookies are sent correctly
	 */
	async deselectBadge(): Promise<void> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/badges/me/select`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при снятии бэйджа' }));
			throw new Error(error.message || error.detail || 'Ошибка при снятии бэйджа');
		}
	}

	/**
	 * Get all badges (admin)
	 * Uses fetch directly and maps snake_case to camelCase
	 */
	async getAllBadgesAdmin(skip: number = 0, limit: number = 50): Promise<Badge[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/admin/badges${params.toString() ? `?${params.toString()}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении бэджиков' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении бэджиков');
		}

		const data = await response.json();
		if (!Array.isArray(data)) return [];

		// Use generated mapper to convert snake_case to camelCase
		return data.map((item: unknown) => BadgeFromJSON(item));
	}

	/**
	 * Get badge by ID (admin)
	 */
	async getBadgeAdmin(badgeId: string): Promise<Badge> {
		return await this.badgesApi.getBadgeAdminApiV1AdminBadgesBadgeIdGet({ badgeId });
	}

	/**
	 * Create badge (admin)
	 * Uses fetch directly because generated API may not handle FormData correctly
	 */
	async createBadge(data: {
		name: string;
		description?: string;
		badgeType: BadgeTypeValue;
		image: File;
		conditionKey?: string;
		targetValue?: number;
		autoCheck?: boolean;
		rewardXp?: number;
		rewardBalance?: number;
		unicodeChar?: string;
	}): Promise<Badge> {
		const formData = new FormData();
		formData.append('name', data.name);
		if (data.description) {
			formData.append('description', data.description);
		}
		formData.append('badge_type', data.badgeType);
		formData.append('image', data.image);
		if (data.conditionKey !== undefined) {
			formData.append('condition_key', data.conditionKey);
		}
		if (data.targetValue !== undefined) {
			formData.append('target_value', String(data.targetValue));
		}
		if (data.autoCheck !== undefined) {
			formData.append('auto_check', String(data.autoCheck));
		}
		if (data.rewardXp !== undefined) {
			formData.append('reward_xp', String(data.rewardXp));
		}
		if (data.rewardBalance !== undefined) {
			formData.append('reward_balance', String(data.rewardBalance));
		}
		if (data.unicodeChar !== undefined) {
			formData.append('unicode_char', data.unicodeChar);
		}

		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/admin/badges`, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при создании бэйджа' }));
			throw new Error(error.message || 'Ошибка при создании бэйджа');
		}

		return await response.json();
	}

	/**
	 * Update badge (admin)
	 * Uses fetch directly because generated API may not handle FormData correctly
	 */
	async updateBadge(
		badgeId: string,
		data: {
			name?: string;
			description?: string;
			badgeType?: BadgeTypeValue;
			image?: File;
			conditionKey?: string;
			targetValue?: number;
			autoCheck?: boolean;
			rewardXp?: number;
			rewardBalance?: number;
			unicodeChar?: string;
		}
	): Promise<Badge> {
		const formData = new FormData();
		if (data.name !== undefined) {
			formData.append('name', data.name);
		}
		if (data.description !== undefined) {
			formData.append('description', data.description);
		}
		if (data.badgeType !== undefined) {
			formData.append('badge_type', data.badgeType);
		}
		if (data.image) {
			formData.append('image', data.image);
		}
		if (data.conditionKey !== undefined) {
			formData.append('condition_key', data.conditionKey);
		}
		if (data.targetValue !== undefined) {
			formData.append('target_value', String(data.targetValue));
		}
		if (data.autoCheck !== undefined) {
			formData.append('auto_check', String(data.autoCheck));
		}
		if (data.rewardXp !== undefined) {
			formData.append('reward_xp', String(data.rewardXp));
		}
		if (data.rewardBalance !== undefined) {
			formData.append('reward_balance', String(data.rewardBalance));
		}
		if (data.unicodeChar !== undefined) {
			formData.append('unicode_char', data.unicodeChar);
		}

		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/admin/badges/${badgeId}`, {
			method: 'PUT',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при обновлении бэйджа' }));
			throw new Error(error.message || 'Ошибка при обновлении бэйджа');
		}

		return await response.json();
	}

	/**
	 * Delete badge (admin)
	 */
	async deleteBadge(badgeId: string): Promise<void> {
		await this.badgesApi.deleteBadgeApiV1AdminBadgesBadgeIdDelete({ badgeId });
	}

	/**
	 * Award badge to user (admin)
	 */
	async awardBadge(
		badgeId: string,
		userId: string,
		expiresAt?: string | null
	): Promise<UserBadgeWithBadge> {
		const request: AwardBadgeRequest = {};
		if (expiresAt !== undefined && expiresAt !== null) {
			// Convert datetime-local format to ISO string
			const date = new Date(expiresAt);
			request.expiresAt = ExpiresAtFromJSON(date.toISOString());
		} else if (expiresAt === null) {
			request.expiresAt = undefined;
		}
		return await this.badgesApi.awardBadgeApiV1AdminBadgesBadgeIdAwardUserIdPost({
			badgeId,
			userId,
			awardBadgeRequest: request,
		});
	}

	/**
	 * Revoke badge from user (admin)
	 */
	async revokeBadge(badgeId: string, userId: string): Promise<void> {
		await this.badgesApi.revokeBadgeApiV1AdminBadgesBadgeIdRevokeUserIdDelete({ badgeId, userId });
	}

	/**
	 * Get badge conditions (public)
	 * Returns list of all available condition keys with descriptions
	 */
	async getBadgeConditions(): Promise<BadgeCondition[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/badges/conditions`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении условий' }));
			throw new Error(error.message || 'Ошибка при получении условий');
		}

		const data = await response.json();
		return Array.isArray(data) ? data : [];
	}
}

export const badgeService = new BadgeService();
