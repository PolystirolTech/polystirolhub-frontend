/**
 * Season Countdown Utilities
 *
 * Утилиты для расчета и форматирования обратного отсчета до даты сезона
 */

/**
 * Результат расчета обратного отсчета
 */
export interface SeasonCountdownResult {
	text: string;
	type: 'before_start' | 'during' | 'after_end' | 'no_season';
	isActive: boolean;
}

/**
 * Получить строковое представление даты сезона
 */
function getSeasonDateString(seasonDate: unknown): string | null {
	if (!seasonDate) return null;
	if (typeof seasonDate === 'string') {
		// Если это строка в формате YYYY-MM-DD, возвращаем как есть
		if (seasonDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return seasonDate;
		}
		// Если это ISO строка, извлекаем дату
		try {
			const date = new Date(seasonDate);
			if (!isNaN(date.getTime())) {
				return date.toISOString().split('T')[0];
			}
		} catch {
			return null;
		}
	}
	return null;
}

/**
 * Рассчитать разницу во времени до даты
 */
function calculateTimeDifference(targetDate: Date): {
	days: number;
	hours: number;
	minutes: number;
	isPast: boolean;
} {
	const now = new Date();
	const diff = targetDate.getTime() - now.getTime();
	const isPast = diff < 0;
	const absDiff = Math.abs(diff);

	const days = Math.ceil(absDiff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

	return { days, hours, minutes, isPast };
}

/**
 * Форматировать время в читаемую строку (только дни)
 */
function formatTimeString(days: number): string {
	if (days > 0) {
		return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
	}
	// Если дней нет, но есть часы или минуты, показываем "менее дня"
	return 'менее дня';
}

/**
 * Рассчитать обратный отсчет до сезона
 *
 * @param seasonStart - Дата начала сезона (строка в формате YYYY-MM-DD или объект SeasonStart1)
 * @param seasonEnd - Дата окончания сезона (строка в формате YYYY-MM-DD или объект SeasonEnd1)
 * @returns Результат расчета обратного отсчета
 */
export function calculateSeasonCountdown(
	seasonStart: unknown,
	seasonEnd: unknown
): SeasonCountdownResult {
	const startDateStr = getSeasonDateString(seasonStart);
	const endDateStr = getSeasonDateString(seasonEnd);

	// Если нет ни одной даты, возвращаем пустой результат
	if (!startDateStr && !endDateStr) {
		return {
			text: '',
			type: 'no_season',
			isActive: false,
		};
	}

	const now = new Date();
	now.setHours(0, 0, 0, 0); // Сбрасываем время для сравнения только по датам

	let startDate: Date | null = null;
	let endDate: Date | null = null;

	if (startDateStr) {
		startDate = new Date(startDateStr);
		startDate.setHours(0, 0, 0, 0);
	}

	if (endDateStr) {
		endDate = new Date(endDateStr);
		endDate.setHours(0, 0, 0, 0);
	}

	// Если есть обе даты
	if (startDate && endDate) {
		// Если текущая дата до начала сезона
		if (now < startDate) {
			const diff = calculateTimeDifference(startDate);
			return {
				text: `До старта: ${formatTimeString(diff.days)}`,
				type: 'before_start',
				isActive: false,
			};
		}
		// Если текущая дата между началом и концом
		if (now >= startDate && now <= endDate) {
			const diff = calculateTimeDifference(endDate);
			return {
				text: `До конца: ${formatTimeString(diff.days)}`,
				type: 'during',
				isActive: true,
			};
		}
		// Если текущая дата после конца
		return {
			text: 'Сезон завершен',
			type: 'after_end',
			isActive: false,
		};
	}

	// Если есть только дата начала
	if (startDate && !endDate) {
		if (now < startDate) {
			const diff = calculateTimeDifference(startDate);
			return {
				text: `До старта: ${formatTimeString(diff.days)}`,
				type: 'before_start',
				isActive: false,
			};
		}
		// Если сезон уже начался, но нет даты окончания
		return {
			text: 'Сезон активен',
			type: 'during',
			isActive: true,
		};
	}

	// Если есть только дата окончания
	if (endDate && !startDate) {
		if (now <= endDate) {
			const diff = calculateTimeDifference(endDate);
			return {
				text: `До конца: ${formatTimeString(diff.days)}`,
				type: 'during',
				isActive: true,
			};
		}
		return {
			text: 'Сезон завершен',
			type: 'after_end',
			isActive: false,
		};
	}

	// Fallback (не должно произойти)
	return {
		text: '',
		type: 'no_season',
		isActive: false,
	};
}
