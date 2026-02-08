'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

interface BalanceContextType {
	balance: number | null;
	isLoading: boolean;
	error: string | null;
	refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

interface BalanceData {
	balance: number;
}

export function BalanceProvider({ children }: { children: React.ReactNode }) {
	const [balance, setBalance] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { isAuthenticated } = useAuth();

	const fetchBalance = useCallback(async () => {
		if (!isAuthenticated) {
			setBalance(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
			const response = await fetch(`${baseUrl}/api/v1/users/me/balance`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// If 401, user is not authenticated - just set balance to null, don't show error
			if (response.status === 401) {
				setBalance(null);
				return;
			}

			if (!response.ok) {
				throw new Error(`Failed to fetch balance: ${response.statusText}`);
			}

			const data: BalanceData = await response.json();
			setBalance(data.balance);
		} catch (err) {
			console.error('Failed to fetch balance:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch balance');
			setBalance(null);
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		fetchBalance();
	}, [fetchBalance]);

	const value = {
		balance,
		isLoading,
		error,
		refreshBalance: fetchBalance,
	};

	return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>;
}

export function useBalanceContext() {
	const context = useContext(BalanceContext);
	if (context === undefined) {
		throw new Error('useBalanceContext must be used within a BalanceProvider');
	}
	return context;
}
