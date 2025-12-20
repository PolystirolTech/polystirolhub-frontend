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
	 * Normalize goal data from snake_case to camelCase
	 */
	private normalizeGoal(goal: unknown): ResourceGoal {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = goal as any;

		// Если данные приходят в snake_case, преобразуем все поля
		if (
			g.server_id !== undefined ||
			g.resource_type !== undefined ||
			g.target_amount !== undefined
		) {
			return {
				id: g.id || '',
				serverId: g.server_id || g.serverId || '',
				name: g.name || '',
				resourceType: g.resource_type || g.resourceType || '',
				targetAmount:
					typeof (g.target_amount ?? g.targetAmount) === 'number'
						? (g.target_amount ?? g.targetAmount)
						: Number(g.target_amount ?? g.targetAmount) || 0,
				isActive:
					g.is_active !== undefined ? g.is_active : g.isActive !== undefined ? g.isActive : true,
				createdAt: g.created_at || g.createdAt || '',
				updatedAt: g.updated_at || g.updatedAt || '',
			} as ResourceGoal;
		}

		// Если данные уже в camelCase, убеждаемся что targetAmount это число
		if (g.targetAmount !== undefined && typeof g.targetAmount !== 'number') {
			return {
				...g,
				targetAmount: Number(g.targetAmount) || 0,
			} as ResourceGoal;
		}

		return g as ResourceGoal;
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
		if (!Array.isArray(data)) return [];

		// Нормализуем данные: преобразуем snake_case в camelCase
		return data.map((goal: unknown) => this.normalizeGoal(goal));
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

		const data = await response.json();
		return this.normalizeGoal(data);
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

		const responseData = await response.json();
		return this.normalizeGoal(responseData);
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

		const responseData = await response.json();
		return this.normalizeGoal(responseData);
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
