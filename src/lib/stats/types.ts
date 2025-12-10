/**
 * Общие типы и интерфейсы для статистики игр
 * Используются как базовые типы для расширения новыми играми
 */

/**
 * Базовый интерфейс для статистики игрока
 */
export interface BasePlayerStats {
	uuid: string;
	name: string;
}

/**
 * Базовый интерфейс для статистики сервера
 */
export interface BaseServerStats {
	serverId: string | number;
	name: string;
}

/**
 * Тип игры для статистики
 */
export type GameType = 'minecraft' | 'cs2' | 'dota2' | string;

/**
 * Конфигурация статистики для игры
 */
export interface GameStatsConfig {
	gameType: GameType;
	displayName: string;
	hasPlayerStats: boolean;
	hasServerStats: boolean;
}
