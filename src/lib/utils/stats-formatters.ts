/**
 * Универсальные утилиты форматирования для статистики игр
 * Используются для всех игр (Minecraft, CS2, Dota 2 и т.д.)
 */

/**
 * Форматирует время игры из миллисекунд в читаемый формат
 * @param ms - время в миллисекундах
 * @returns Отформатированная строка (например, "2д 5ч 30м" или "1ч 15м")
 */
export function formatPlaytime(ms: number): string {
	if (!ms || ms <= 0) return '0м';

	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days}д ${hours % 24}ч ${minutes % 60}м`;
	} else if (hours > 0) {
		return `${hours}ч ${minutes % 60}м`;
	} else if (minutes > 0) {
		return `${minutes}м ${seconds % 60}с`;
	} else {
		return `${seconds}с`;
	}
}

/**
 * Форматирует timestamp в читаемую дату и время
 * @param ms - timestamp в миллисекундах
 * @returns Отформатированная строка даты и времени
 */
export function formatTimestamp(ms: number): string {
	if (!ms || ms <= 0) return 'Неизвестно';

	return new Date(ms).toLocaleString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Вычисляет коэффициент K/D (Kills/Deaths)
 * @param kills - количество убийств
 * @param deaths - количество смертей
 * @returns Отформатированный коэффициент K/D (например, "2.50" или "5.00")
 */
export function calculateKDRatio(kills: number, deaths: number): string {
	if (!kills || kills === 0) return '0.00';
	if (!deaths || deaths === 0) return kills.toFixed(2);

	return (kills / deaths).toFixed(2);
}
