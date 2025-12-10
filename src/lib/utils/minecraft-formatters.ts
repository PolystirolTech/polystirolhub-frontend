/**
 * Утилиты форматирования специфичные для Minecraft
 */

/**
 * Получает название платформы Minecraft
 * @param platform - номер платформы: 0 = Java, 1 = Bedrock
 * @returns Название платформы
 */
export function getMinecraftPlatformName(platform: number | null): string {
	if (platform === null) return 'Неизвестно';
	return platform === 0 ? 'Java Edition' : 'Bedrock Edition';
}

/**
 * Получает URL аватара игрока Minecraft через minotar.net
 * @param username - имя игрока Minecraft
 * @returns URL аватара
 */
export function getMinecraftAvatarUrl(username: string): string {
	if (!username) return '';
	return `https://minotar.net/avatar/${encodeURIComponent(username)}`;
}
