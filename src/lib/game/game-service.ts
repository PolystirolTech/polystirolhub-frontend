/**
 * Game Service
 *
 * Service layer for handling game types and game servers API calls
 */

import { GameServersApi, apiConfig } from '@/lib/api';
import { GameServerResponseFromJSON } from '@/lib/api/generated';
import type {
	GameTypeResponse,
	GameServerResponse,
	GameServerPublic,
	GameTypeCreate,
	GameTypeUpdate,
} from '@/lib/api/generated';

interface CreateGameServerData {
	name: string;
	gameTypeId: string;
	description?: string;
	mods: string[];
	ip: string;
	port?: string;
	banner?: File | null;
}

interface UpdateGameServerData {
	name?: string;
	gameTypeId?: string;
	description?: string;
	mods?: string[];
	ip?: string;
	port?: string;
	banner?: File | null;
}

class GameService {
	private gameServersApi: GameServersApi;
	private baseUrl: string;

	constructor() {
		this.gameServersApi = new GameServersApi(apiConfig);
		this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
	}

	/**
	 * Get public list of game types
	 */
	async getGameTypes(): Promise<GameTypeResponse[]> {
		try {
			const response = await this.gameServersApi.getGameTypesApiV1GameTypesGet();
			return Array.isArray(response) ? response : [];
		} catch (error) {
			console.error('Failed to get game types:', error);
			throw new Error('Не удалось загрузить типы игр');
		}
	}

	/**
	 * Get public list of game servers
	 */
	async getGameServers(): Promise<GameServerPublic[]> {
		try {
			const response = await this.gameServersApi.getGameServersApiV1GameServersGet();
			return Array.isArray(response) ? response : [];
		} catch (error) {
			console.error('Failed to get game servers:', error);
			throw new Error('Не удалось загрузить список серверов');
		}
	}

	/**
	 * Get public game server by ID
	 */
	async getGameServer(serverId: string): Promise<GameServerPublic> {
		try {
			return await this.gameServersApi.getGameServerApiV1GameServersServerIdGet({
				serverId,
			});
		} catch (error) {
			console.error('Failed to get game server:', error);
			throw new Error('Не удалось загрузить сервер');
		}
	}

	/**
	 * Get admin list of game types
	 */
	async getAdminGameTypes(): Promise<GameTypeResponse[]> {
		try {
			const response = await this.gameServersApi.listGameTypesApiV1AdminGameTypesGet();
			return Array.isArray(response) ? response : [];
		} catch (error) {
			console.error('Failed to get admin game types:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось загрузить типы игр');
		}
	}

	/**
	 * Create game type (admin only)
	 */
	async createGameType(name: string): Promise<GameTypeResponse> {
		try {
			const gameTypeCreate: GameTypeCreate = { name };
			return await this.gameServersApi.createGameTypeApiV1AdminGameTypesPost({
				gameTypeCreate,
			});
		} catch (error) {
			console.error('Failed to create game type:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось создать тип игры');
		}
	}

	/**
	 * Update game type (admin only)
	 */
	async updateGameType(typeId: string, name: string): Promise<GameTypeResponse> {
		try {
			// Name is an empty interface wrapper, so we pass the string directly
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const gameTypeUpdate: GameTypeUpdate = { name: name as any };
			return await this.gameServersApi.updateGameTypeApiV1AdminGameTypesTypeIdPut({
				typeId,
				gameTypeUpdate,
			});
		} catch (error) {
			console.error('Failed to update game type:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось обновить тип игры');
		}
	}

	/**
	 * Delete game type (admin only)
	 */
	async deleteGameType(typeId: string): Promise<void> {
		try {
			await this.gameServersApi.deleteGameTypeApiV1AdminGameTypesTypeIdDelete({
				typeId,
			});
		} catch (error) {
			console.error('Failed to delete game type:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось удалить тип игры');
		}
	}

	/**
	 * Get admin list of game servers
	 * Uses direct fetch to ensure game_type_id is properly extracted
	 */
	async getAdminGameServers(): Promise<GameServerResponse[]> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/admin/game-servers`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
			}

			const rawData = await response.json();
			const servers = Array.isArray(rawData) ? rawData : [];

			// Преобразуем сырые данные, сохраняя game_type_id из game_type.id
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return servers.map((server: any) => {
				// Используем генератор для правильной структуры
				const parsed = GameServerResponseFromJSON(server);
				// Извлекаем game_type_id из объекта game_type, если он есть
				if (!parsed.gameTypeId && server.game_type && server.game_type.id) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(parsed as any).gameTypeId = server.game_type.id;
				}
				// Также сохраняем, если game_type_id есть напрямую в ответе
				if (!parsed.gameTypeId && server.game_type_id) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(parsed as any).gameTypeId = server.game_type_id;
				}
				return parsed;
			});
		} catch (error) {
			console.error('Failed to get admin game servers:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось загрузить список серверов');
		}
	}

	/**
	 * Get admin game server by ID
	 */
	async getAdminGameServer(serverId: string): Promise<GameServerResponse> {
		try {
			return await this.gameServersApi.getGameServerAdminApiV1AdminGameServersServerIdGet({
				serverId,
			});
		} catch (error) {
			console.error('Failed to get admin game server:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось загрузить сервер');
		}
	}

	/**
	 * Create game server (admin only)
	 * Uses direct fetch for proper FormData handling with files
	 */
	async createGameServer(data: CreateGameServerData): Promise<GameServerResponse> {
		try {
			const formData = new FormData();
			formData.append('name', data.name);
			formData.append('game_type_id', data.gameTypeId);
			formData.append('ip', data.ip);
			if (data.description) {
				formData.append('description', data.description);
			}
			if (data.mods && data.mods.length > 0) {
				formData.append('mods', JSON.stringify(data.mods));
			}
			if (data.port) {
				formData.append('port', data.port);
			}
			if (data.banner) {
				formData.append('banner', data.banner);
			}

			const response = await fetch(`${this.baseUrl}/api/v1/admin/game-servers`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Failed to create game server:', error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Не удалось создать сервер');
		}
	}

	/**
	 * Update game server (admin only)
	 * Uses direct fetch for proper FormData handling with files
	 */
	async updateGameServer(
		serverId: string,
		data: UpdateGameServerData
	): Promise<GameServerResponse> {
		try {
			const formData = new FormData();
			if (data.name !== undefined) {
				formData.append('name', data.name);
			}
			if (data.gameTypeId !== undefined) {
				formData.append('game_type_id', data.gameTypeId);
			}
			if (data.description !== undefined) {
				// Отправляем description только если он не пустой
				if (data.description.trim()) {
					formData.append('description', data.description.trim());
				}
			}
			if (data.mods !== undefined) {
				formData.append('mods', JSON.stringify(data.mods));
			}
			if (data.ip !== undefined) {
				formData.append('ip', data.ip);
			}
			if (data.port !== undefined) {
				if (data.port.trim()) {
					formData.append('port', data.port.trim());
				}
			}
			if (data.banner) {
				formData.append('banner', data.banner);
			}

			const response = await fetch(`${this.baseUrl}/api/v1/admin/game-servers/${serverId}`, {
				method: 'PUT',
				credentials: 'include',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				// Обработка разных форматов ошибок
				let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
				if (errorData.detail) {
					if (typeof errorData.detail === 'string') {
						errorMessage = errorData.detail;
					} else if (Array.isArray(errorData.detail)) {
						// Валидационные ошибки FastAPI
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						errorMessage = (errorData.detail as any[])
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							.map((err: any) => err.msg || JSON.stringify(err))
							.join(', ');
					} else if (typeof errorData.detail === 'object') {
						errorMessage = JSON.stringify(errorData.detail);
					}
				} else if (errorData.message) {
					errorMessage = errorData.message;
				}
				throw new Error(errorMessage);
			}

			return await response.json();
		} catch (error) {
			console.error('Failed to update game server:', error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Не удалось обновить сервер');
		}
	}

	/**
	 * Delete game server (admin only)
	 */
	async deleteGameServer(serverId: string): Promise<void> {
		try {
			await this.gameServersApi.deleteGameServerApiV1AdminGameServersServerIdDelete({
				serverId,
			});
		} catch (error) {
			console.error('Failed to delete game server:', error);
			const errorMessage = this.getErrorMessage(error);
			throw new Error(errorMessage || 'Не удалось удалить сервер');
		}
	}

	/**
	 * Extract error message from API error
	 */
	private getErrorMessage(error: unknown): string | null {
		if (error && typeof error === 'object' && 'response' in error) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = (error as any).response;
			if (response && typeof response === 'object') {
				// Try to get detail from response
				if ('detail' in response && typeof response.detail === 'string') {
					return response.detail;
				}
				// Try to get message from response
				if ('message' in response && typeof response.message === 'string') {
					return response.message;
				}
			}
		}
		if (error instanceof Error) {
			return error.message;
		}
		return null;
	}
}

// Export singleton instance
export const gameService = new GameService();
