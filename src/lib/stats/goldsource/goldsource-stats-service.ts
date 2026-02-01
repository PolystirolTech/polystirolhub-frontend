/**
 * Сервис для работы со статистикой GoldSource
 * Обертка над GoldsourceStatisticsApi из generated API
 */

import {
	GoldsourceStatisticsApi,
	type GetPlayerProfileApiV1StatisticsGoldsourcePlayersSteamIdGetRequest,
} from '@/lib/api/generated/apis/GoldsourceStatisticsApi';
import { apiConfig } from '@/lib/api/config';
import type {
	GoldSourcePlayerProfile,
	GoldSourceServerStats,
	GoldSourceTopPlayer,
} from '@/lib/api/generated/models';

class GoldSourceStatsService {
	private api: GoldsourceStatisticsApi;

	constructor() {
		this.api = new GoldsourceStatisticsApi(apiConfig);
	}

	/**
	 * Получает профиль игрока по SteamID
	 */
	async getPlayerProfile(
		steamId: string,
		serverId?: string | number
	): Promise<GoldSourcePlayerProfile | null> {
		try {
			const requestParams: GetPlayerProfileApiV1StatisticsGoldsourcePlayersSteamIdGetRequest & {
				server_id?: string;
			} = { steamId };
			if (serverId) requestParams.server_id = String(serverId);

			const profile =
				await this.api.getPlayerProfileApiV1StatisticsGoldsourcePlayersSteamIdGet(requestParams);
			return profile;
		} catch (error) {
			if (
				error instanceof Error &&
				'status' in error &&
				(error as { status?: number }).status === 404
			) {
				return null;
			}
			console.error('Failed to get GoldSource player profile:', error);
			throw error;
		}
	}

	/**
	 * Получает статистику сервера по его ID
	 */
	async getServerStats(serverId: string | number): Promise<GoldSourceServerStats | null> {
		try {
			const stats = await this.api.getServerStatsApiV1StatisticsGoldsourceServersServerIdStatsGet({
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
			console.error('Failed to get GoldSource server stats:', error);
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
	): Promise<GoldSourceTopPlayer[]> {
		try {
			const basePath = apiConfig.basePath || 'http://localhost:8000';
			const params = new URLSearchParams();
			if (limit !== undefined && limit !== 50) params.append('limit', String(limit));
			if (offset !== undefined && offset > 0) params.append('offset', String(offset));
			const url = `${basePath}/api/v1/statistics/goldsource/servers/${serverId}/players${params.toString() ? `?${params.toString()}` : ''}`;

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
			console.error('Failed to get GoldSource server top players:', error);
			throw error;
		}
	}
}

// Экспортируем singleton экземпляр
export const goldSourceStatsService = new GoldSourceStatsService();
