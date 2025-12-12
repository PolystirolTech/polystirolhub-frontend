'use client';

import { useState, useEffect } from 'react';

interface BalanceData {
	balance: number;
}

export function useBalance() {
	const [balance, setBalance] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBalance = async () => {
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
		};

		fetchBalance();
	}, []);

	return { balance, isLoading, error };
}
