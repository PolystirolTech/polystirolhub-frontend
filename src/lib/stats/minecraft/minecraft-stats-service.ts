/**
 * Сервис для работы со статистикой Minecraft
 * Обертка над StatisticsApi из generated API
 */

import { StatisticsApi } from '@/lib/api/generated/apis/StatisticsApi';
import { apiConfig } from '@/lib/api/config';
import type {
	MinecraftPlayerProfile,
	MinecraftServerStats,
	MinecraftKillResponse,
	MinecraftTopPlayer,
	MinecraftSessionResponse,
} from '@/lib/api/generated/models';

class MinecraftStatsService {
	private api: StatisticsApi;

	constructor() {
		this.api = new StatisticsApi(apiConfig);
	}

	/**
	 * Получает профиль игрока по UUID
	 */
	async getPlayerProfile(
		playerUuid: string,
		serverId?: string | number
	): Promise<MinecraftPlayerProfile | null> {
		try {
			// В сгенерированном API может не быть serverId в параметрах,
			// поэтому используем ручной запрос если нужно, или проверяем типы
			const requestParams: any = { playerUuid };
			if (serverId) requestParams.serverId = String(serverId);

			const profile =
				await this.api.getPlayerProfileApiV1StatisticsMinecraftPlayersPlayerUuidGet(requestParams);
			return profile;
		} catch (error) {
			if (
				error instanceof Error &&
				'status' in error &&
				(error as { status?: number }).status === 404
			) {
				return null;
			}
			console.error('Failed to get player profile:', error);
			throw error;
		}
	}

	/**
	 * Получает список сессий игрока с пагинацией
	 */
	async getPlayerSessions(
		playerUuid: string,
		limit: number = 20,
		offset: number = 0,
		serverId?: string | number
	): Promise<MinecraftSessionResponse[]> {
		try {
			const requestParams: any = {
				playerUuid,
				limit,
				offset,
			};
			if (serverId) requestParams.serverId = String(serverId);

			const sessions =
				await this.api.getPlayerSessionsApiV1StatisticsMinecraftPlayersPlayerUuidSessionsGet(
					requestParams
				);
			// API возвращает any, поэтому нужно проверить тип
			if (Array.isArray(sessions)) {
				return sessions as MinecraftSessionResponse[];
			}
			return [];
		} catch (error) {
			if (
				error instanceof Error &&
				'status' in error &&
				(error as { status?: number }).status === 404
			) {
				return [];
			}
			console.error('Failed to get player sessions:', error);
			throw error;
		}
	}

	/**
	 * Получает список убийств игрока с пагинацией
	 */
	async getPlayerKills(
		playerUuid: string,
		limit: number = 20,
		offset: number = 0,
		serverId?: string | number
	): Promise<MinecraftKillResponse[]> {
		try {
			const requestParams: any = {
				playerUuid,
				limit,
				offset,
			};
			if (serverId) requestParams.serverId = String(serverId);

			const kills =
				await this.api.getPlayerKillsApiV1StatisticsMinecraftPlayersPlayerUuidKillsGet(
					requestParams
				);
			return Array.isArray(kills) ? kills : [];
		} catch (error) {
			if (
				error instanceof Error &&
				'status' in error &&
				(error as { status?: number }).status === 404
			) {
				return [];
			}
			console.error('Failed to get player kills:', error);
			throw error;
		}
	}

	/**
	 * Получает статистику сервера по его ID
	 */
	async getServerStats(serverId: string | number): Promise<MinecraftServerStats | null> {
		try {
			const stats = await this.api.getServerStatsApiV1StatisticsMinecraftServersServerIdStatsGet({
				serverId: String(serverId),
			});
			return stats;
		} catch (error) {
			if (
				error instanceof Error &&
				'status' in error &&
				(error as { status?: number }).status === 404
			) {
				return null;
			}
			console.error('Failed to get server stats:', error);
			throw error;
		}
	}

	/**
	 * Получает топ игроков сервера
	 */
	async getServerTopPlayers(
		serverId: string | number,
		limit: number = 50,
		offset: number = 0
	): Promise<MinecraftTopPlayer[]> {
		try {
			const basePath = apiConfig.basePath || 'http://localhost:8000';
			const params = new URLSearchParams();
			if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
			if (offset !== undefined && offset > 0) params.append('offset', String(offset));
			const url = `${basePath}/api/v1/statistics/minecraft/servers/${serverId}/players${params.toString() ? `?${params.toString()}` : ''}`;

			const response = await fetch(url, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					const error = new Error('Статистика сервера не найдена');
					(error as Error & { status?: number }).status = 404;
					throw error;
				}
				const error = await response
					.json()
					.catch(() => ({ message: 'Ошибка при получении топа игроков' }));
				throw new Error(error.message || error.detail || 'Ошибка при получении топа игроков');
			}

			const players = await response.json();
			return Array.isArray(players) ? players : [];
		} catch (error) {
			// Пробрасываем ошибку дальше, чтобы компонент мог её обработать
			console.error('Failed to get server top players:', error);
			throw error;
		}
	}
}

// Экспортируем singleton экземпляр
export const minecraftStatsService = new MinecraftStatsService();
