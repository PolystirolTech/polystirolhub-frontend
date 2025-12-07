'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from 'react';
import { progressionService } from '@/lib/progression/progression-service';
import type { ProgressionData } from '@/lib/progression/types';

interface LevelContextType {
	level: number;
	currentXp: number;
	nextLevelXp: number;
	isLoading: boolean;
	error: string | null;
	addXp: (amount: number) => Promise<void>;
	resetLevel: () => Promise<void>;
	refreshProgression: () => Promise<void>;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);
const LEVEL_STORAGE_KEY = 'polystirolhub_level';

interface StoredLevelData {
	level: number;
	currentXp: number;
	nextLevelXp: number;
}

export function LevelProvider({ children }: { children: ReactNode }) {
	// Начинаем с дефолтных значений для одинакового рендера на сервере и клиенте
	const [level, setLevel] = useState(1);
	const [currentXp, setCurrentXp] = useState(0);
	const [nextLevelXp, setNextLevelXp] = useState(100);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Update state from API response
	const updateFromProgression = (data: ProgressionData) => {
		const newLevel = data.level;
		const newCurrentXp = data.xp_progress; // XP accumulated at current level (from xp_for_current_level to current)
		const newNextLevelXp = data.xp_progress + data.xp_needed; // Total XP needed for this level

		setLevel(newLevel);
		setCurrentXp(newCurrentXp);
		setNextLevelXp(newNextLevelXp);

		// Сохраняем в localStorage
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(
					LEVEL_STORAGE_KEY,
					JSON.stringify({
						level: newLevel,
						currentXp: newCurrentXp,
						nextLevelXp: newNextLevelXp,
					})
				);
			} catch {
				// Игнорируем ошибки сохранения
			}
		}
	};

	// Fetch progression data from API
	const refreshProgression = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await progressionService.getProgression();
			updateFromProgression(data);
		} catch (err) {
			console.error('Failed to fetch progression:', err);
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Загружаем из localStorage и затем обновляем с сервера
	useEffect(() => {
		// Загружаем из localStorage сразу после монтирования
		try {
			const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as StoredLevelData;
				setLevel(parsed.level);
				setCurrentXp(parsed.currentXp);
				setNextLevelXp(parsed.nextLevelXp);
			}
		} catch {
			// Игнорируем ошибки парсинга
		}

		// Затем обновляем с сервера
		refreshProgression();
	}, [refreshProgression]);

	// Award XP via API
	const addXp = async (amount: number) => {
		try {
			setError(null);
			const data = await progressionService.awardXp(amount);
			// Optionally update from response if it contains full data,
			// but refreshing ensures we get the exact same format as getProgression
			updateFromProgression(data);
			// Verify by re-fetching (can generate double update but ensures consistency)
			await refreshProgression();
		} catch (err) {
			console.error('Failed to award XP:', err);
			setError(err instanceof Error ? err.message : 'Failed to award XP');
			// Don't throw - just log and show error in UI if needed
		}
	};

	// Reset progression via API
	const resetLevel = async () => {
		try {
			setError(null);
			const data = await progressionService.resetProgression();
			updateFromProgression(data);
			await refreshProgression();
		} catch (err) {
			console.error('Failed to reset progression:', err);
			setError(err instanceof Error ? err.message : 'Failed to reset progression');
			// Don't throw - just log and show error in UI if needed
		}
	};

	return (
		<LevelContext.Provider
			value={{
				level,
				currentXp,
				nextLevelXp,
				isLoading,
				error,
				addXp,
				resetLevel,
				refreshProgression,
			}}
		>
			{children}
		</LevelContext.Provider>
	);
}

export function useLevel() {
	const context = useContext(LevelContext);
	if (context === undefined) {
		throw new Error('useLevel must be used within a LevelProvider');
	}
	return context;
}
