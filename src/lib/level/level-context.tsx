'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export function LevelProvider({ children }: { children: ReactNode }) {
	// State from API
	const [level, setLevel] = useState(1);
	const [currentXp, setCurrentXp] = useState(0);
	const [nextLevelXp, setNextLevelXp] = useState(100);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Update state from API response
	const updateFromProgression = (data: ProgressionData) => {
		setLevel(data.level);
		setCurrentXp(data.xp_progress); // XP accumulated at current level (from xp_for_current_level to current)
		// Total XP needed for this level = xp_progress + xp_needed
		setNextLevelXp(data.xp_progress + data.xp_needed);
	};

	// Fetch progression data from API
	const refreshProgression = async () => {
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
	};

	// Load progression on mount
	useEffect(() => {
		refreshProgression();
	}, []);

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
