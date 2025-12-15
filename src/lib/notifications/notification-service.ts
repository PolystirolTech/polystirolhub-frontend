/**
 * Notification Service
 *
 * Service layer for working with notifications API
 */

import { NotificationsApi, apiConfig, type NotificationResponse } from '@/lib/api';
import { NotificationResponseFromJSON } from '@/lib/api/generated/models/NotificationResponse';

class NotificationService {
	private notificationsApi: NotificationsApi;

	constructor() {
		this.notificationsApi = new NotificationsApi(apiConfig);
	}

	/**
	 * Получить 3 последних уведомления
	 * Uses fetch directly to ensure cookies are sent correctly
	 */
	async getRecentNotifications(): Promise<NotificationResponse[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';
		try {
			const response = await fetch(`${basePath}/api/v1/notifications/recent`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// 401 - пользователь не авторизован, возвращаем пустой массив без ошибки
			if (response.status === 401) {
				return [];
			}

			if (!response.ok) {
				console.error(
					`Failed to fetch recent notifications: ${response.status} ${response.statusText}`
				);
				return [];
			}

			const data = await response.json();
			if (!Array.isArray(data)) return [];

			// Преобразуем ответы API в типизированные объекты
			return data.map((item: unknown) => NotificationResponseFromJSON(item));
		} catch (error) {
			console.error('Failed to fetch recent notifications:', error);
			// Не пробрасываем ошибку, возвращаем пустой массив
			// Это позволяет компонентам корректно обрабатывать отсутствие авторизации
			return [];
		}
	}

	/**
	 * Получить все уведомления с пагинацией
	 * Uses fetch directly to ensure cookies are sent correctly
	 */
	async getAllNotifications(skip: number = 0, limit: number = 50): Promise<NotificationResponse[]> {
		const basePath = apiConfig.basePath || 'http://localhost:8000';

		// Ограничиваем лимит максимум 100
		const safeLimit = Math.min(limit, 100);

		try {
			const url = new URL(`${basePath}/api/v1/notifications`);
			url.searchParams.set('skip', String(skip));
			url.searchParams.set('limit', String(safeLimit));

			const response = await fetch(url.toString(), {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// 401 - пользователь не авторизован
			if (response.status === 401) {
				throw new Error('Unauthorized');
			}

			if (!response.ok) {
				const error = await response
					.json()
					.catch(() => ({ message: 'Ошибка при получении уведомлений' }));
				throw new Error(error.message || error.detail || `Ошибка ${response.status}`);
			}

			const data = await response.json();
			if (!Array.isArray(data)) return [];

			// Преобразуем ответы API в типизированные объекты
			return data.map((item: unknown) => NotificationResponseFromJSON(item));
		} catch (error) {
			console.error('Failed to fetch all notifications:', error);
			throw error;
		}
	}
}

export const notificationService = new NotificationService();
