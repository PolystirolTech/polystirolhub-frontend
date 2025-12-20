/**
 * Resource Collection Service
 *
 * Service layer for working with resource collection API
 */

import type { ServerProgressResponse, ResourceGoal, CreateGoalData, UpdateGoalData } from './types';

class ResourceCollectionService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
	}

	/**
	 * Get server progress (public endpoint)
	 */
	async getServerProgress(serverId: string): Promise<ServerProgressResponse> {
		const url = `${this.baseUrl}/api/v1/resource-collection/servers/${serverId}/progress`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.status === 404) {
			throw new Error('Сервер не найден');
		}

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'Ошибка при получении прогресса' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении прогресса');
		}

		return await response.json();
	}

	/**
	 * Get goals list (admin)
	 */
	async getGoals(serverId?: string, skip: number = 0, limit: number = 50): Promise<ResourceGoal[]> {
		const params = new URLSearchParams();
		if (serverId) {
			params.append('server_id', serverId);
		}
		if (skip > 0) {
			params.append('skip', String(skip));
		}
		if (limit !== 50) {
			params.append('limit', String(limit));
		}

		const url = `${this.baseUrl}/api/v1/resource-collection/admin/goals${params.toString() ? `?${params.toString()}` : ''}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при получении целей' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении целей');
		}

		const data = await response.json();
		return Array.isArray(data) ? data : [];
	}

	/**
	 * Get goal by ID (admin)
	 */
	async getGoal(goalId: string): Promise<ResourceGoal> {
		const url = `${this.baseUrl}/api/v1/resource-collection/admin/goals/${goalId}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.status === 404) {
			throw new Error('Цель не найдена');
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при получении цели' }));
			throw new Error(error.message || error.detail || 'Ошибка при получении цели');
		}

		return await response.json();
	}

	/**
	 * Create goal (admin)
	 */
	async createGoal(data: CreateGoalData): Promise<ResourceGoal> {
		const url = `${this.baseUrl}/api/v1/resource-collection/admin/goals`;

		const response = await fetch(url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				server_id: data.serverId,
				name: data.name,
				resource_type: data.resourceType,
				target_amount: data.targetAmount,
				is_active: data.isActive !== undefined ? data.isActive : true,
			}),
		});

		if (response.status === 404) {
			throw new Error('Сервер не найден');
		}

		if (response.status === 400) {
			const error = await response.json().catch(() => ({ message: 'Ошибка валидации' }));
			throw new Error(
				error.message || error.detail || 'Цель для этого типа ресурса уже существует на сервере'
			);
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при создании цели' }));
			throw new Error(error.message || error.detail || 'Ошибка при создании цели');
		}

		return await response.json();
	}

	/**
	 * Update goal (admin)
	 */
	async updateGoal(goalId: string, data: UpdateGoalData): Promise<ResourceGoal> {
		const url = `${this.baseUrl}/api/v1/resource-collection/admin/goals/${goalId}`;

		const body: Record<string, unknown> = {};
		if (data.serverId !== undefined) {
			body.server_id = data.serverId;
		}
		if (data.name !== undefined) {
			body.name = data.name;
		}
		if (data.resourceType !== undefined) {
			body.resource_type = data.resourceType;
		}
		if (data.targetAmount !== undefined) {
			body.target_amount = data.targetAmount;
		}
		if (data.isActive !== undefined) {
			body.is_active = data.isActive;
		}

		const response = await fetch(url, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (response.status === 404) {
			throw new Error('Цель или сервер не найдены');
		}

		if (response.status === 400) {
			const error = await response.json().catch(() => ({ message: 'Ошибка валидации' }));
			throw new Error(
				error.message || error.detail || 'Цель для этого типа ресурса уже существует на сервере'
			);
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при обновлении цели' }));
			throw new Error(error.message || error.detail || 'Ошибка при обновлении цели');
		}

		return await response.json();
	}

	/**
	 * Delete goal (admin)
	 */
	async deleteGoal(goalId: string): Promise<void> {
		const url = `${this.baseUrl}/api/v1/resource-collection/admin/goals/${goalId}`;

		const response = await fetch(url, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.status === 404) {
			throw new Error('Цель не найдена');
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Ошибка при удалении цели' }));
			throw new Error(error.message || error.detail || 'Ошибка при удалении цели');
		}
	}
}

export const resourceCollectionService = new ResourceCollectionService();
