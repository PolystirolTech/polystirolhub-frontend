'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

interface BackgroundContextType {
	activeBackground: string | null;
	// undefined = no override (use user's background)
	// null = override with default theme (no image)
	// string = override with specific image
	setOverrideBackground: (url: string | null | undefined) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	// undefined means "no override active"
	const [overrideBackground, setOverrideBackground] = useState<string | null | undefined>(
		undefined
	);
	// Calculate active background synchronously during render to avoid effect cascades
	// If override is undefined, use user background. Otherwise use override.
	const activeBackground =
		overrideBackground !== undefined ? overrideBackground : user?.background || null;

	return (
		<BackgroundContext.Provider value={{ activeBackground, setOverrideBackground }}>
			{children}
		</BackgroundContext.Provider>
	);
}

export function useBackground() {
	const context = useContext(BackgroundContext);
	if (context === undefined) {
		throw new Error('useBackground must be used within a BackgroundProvider');
	}
	return context;
}
