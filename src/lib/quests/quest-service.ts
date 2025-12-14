/**
 * Quest Service
 *
 * Service layer for working with quests API
 */

import { QuestsApi, apiConfig, type Quest, type UserQuestWithQuest } from '@/lib/api';
import { UserQuestWithQuestFromJSON } from '@/lib/api/generated/models/UserQuestWithQuest';
import { QuestFromJSON } from '@/lib/api/generated/models/Quest';

class QuestService {
	private questsApi: QuestsApi;

	constructor() {
		this.questsApi = new QuestsApi(apiConfig);
	}

	/**
	 * Get all public active quests
	 */
	async getAllQuests(skip: number = 0, limit: number = 50): Promise<Quest[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/quests${params.toString() ? `?${params.toString()}` : ''}`;

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
				.catch(() => ({ message: 'Ошибка при получении квестов' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении квестов');
		}

		const data = await response.json();
		if (!Array.isArray(data)) return [];
		return data.map((item: unknown) => QuestFromJSON(item));
	}

	/**
	 * Get user's quests with progress
	 * Uses fetch directly to ensure cookies are sent correctly
	 * Maps snake_case to camelCase for proper type compatibility
	 */
	async getMyQuests(skip: number = 0, limit: number = 50): Promise<UserQuestWithQuest[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/quests/me${params.toString() ? `?${params.toString()}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// If 401, user is not authenticated - return empty array
		if (response.status === 401) {
			return [];
		}

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении квестов' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении квестов');
		}

		const data = await response.json();
		if (!Array.isArray(data)) return [];

		// Use generated mapper to convert snake_case to camelCase
		return data.map((item: unknown) => UserQuestWithQuestFromJSON(item));
	}

	/**
	 * Get all quests (admin)
	 * Uses fetch directly and maps snake_case to camelCase
	 */
	async getAllQuestsAdmin(skip: number = 0, limit: number = 50): Promise<Quest[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const params = new URLSearchParams();
		if (skip !== undefined && skip > 0) params.append('skip', String(skip));
		if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
		const url = `${basePath}/api/v1/admin/quests${params.toString() ? `?${params.toString()}` : ''}`;

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
				.catch(() => ({ message: 'Ошибка при получении квестов' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении квестов');
		}

		const data = await response.json();
		if (!Array.isArray(data)) return [];

		// Use generated mapper to convert snake_case to camelCase
		return data.map((item: unknown) => QuestFromJSON(item));
	}

	/**
	 * Get quest by ID (admin)
	 */
	async getQuestAdmin(questId: string): Promise<Quest> {
		return await this.questsApi.getQuestAdminApiV1AdminQuestsQuestIdGet({ questId });
	}

	/**
	 * Create quest (admin)
	 * Uses fetch directly because generated API may not handle FormData correctly
	 */
	async createQuest(data: {
		name: string;
		description?: string;
		questType: string;
		conditionKey: string;
		targetValue: number;
		rewardXp?: number;
		rewardBalance?: number;
		isActive?: boolean;
	}): Promise<Quest> {
		const formData = new FormData();
		formData.append('name', data.name);
		if (data.description) {
			formData.append('description', data.description);
		}
		formData.append('quest_type', data.questType);
		formData.append('condition_key', data.conditionKey);
		formData.append('target_value', String(data.targetValue));
		if (data.rewardXp !== undefined) {
			formData.append('reward_xp', String(data.rewardXp));
		}
		if (data.rewardBalance !== undefined) {
			formData.append('reward_balance', String(data.rewardBalance));
		}
		if (data.isActive !== undefined) {
			formData.append('is_active', String(data.isActive));
		}

		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/admin/quests`, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при создании квеста' }));
			throw new Error(error.message || 'Ошибка при создании квеста');
		}

		const result = await response.json();
		return QuestFromJSON(result);
	}

	/**
	 * Update quest (admin)
	 * Uses fetch directly because generated API may not handle FormData correctly
	 */
	async updateQuest(
		questId: string,
		data: {
			name?: string;
			description?: string;
			questType?: string;
			conditionKey?: string;
			targetValue?: number;
			rewardXp?: number;
			rewardBalance?: number;
			isActive?: boolean;
		}
	): Promise<Quest> {
		const formData = new FormData();
		if (data.name !== undefined) {
			formData.append('name', data.name);
		}
		if (data.description !== undefined) {
			formData.append('description', data.description);
		}
		if (data.questType !== undefined) {
			formData.append('quest_type', data.questType);
		}
		if (data.conditionKey !== undefined) {
			formData.append('condition_key', data.conditionKey);
		}
		if (data.targetValue !== undefined) {
			formData.append('target_value', String(data.targetValue));
		}
		if (data.rewardXp !== undefined) {
			formData.append('reward_xp', String(data.rewardXp));
		}
		if (data.rewardBalance !== undefined) {
			formData.append('reward_balance', String(data.rewardBalance));
		}
		if (data.isActive !== undefined) {
			formData.append('is_active', String(data.isActive));
		}

		const basePath = apiConfig.basePath || 'http://localhost:8000';
		const response = await fetch(`${basePath}/api/v1/admin/quests/${questId}`, {
			method: 'PUT',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при обновлении квеста' }));
			throw new Error(error.message || 'Ошибка при обновлении квеста');
		}

		const result = await response.json();
		return QuestFromJSON(result);
	}

	/**
	 * Delete quest (admin)
	 */
	async deleteQuest(questId: string): Promise<void> {
		await this.questsApi.deleteQuestApiV1AdminQuestsQuestIdDelete({ questId });
	}
}

export const questService = new QuestService();
