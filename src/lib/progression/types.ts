/**
 * Progression System Types
 *
 * Types for the user XP and level progression system
 */

export interface ProgressionData {
	/** Текущий уровень пользователя */
	level: number;

	/** Общий накопленный опыт */
	total_xp: number;

	/** XP, требуемый для текущего уровня */
	xp_for_current_level: number;

	/** XP, требуемый для следующего уровня */
	xp_for_next_level: number;

	/** XP, накопленный на текущем уровне (от начала уровня) */
	xp_progress: number;

	/** XP, необходимое для следующего уровня */
	xp_needed: number;

	/** Процент прогресса до следующего уровня (0-100) */
	progress_percent: number;
}

export interface AwardXpRequest {
	xp_amount: number;
}
