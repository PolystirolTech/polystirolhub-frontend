'use client';

import { useBalanceContext } from '@/lib/balance-context';

export function useBalance() {
	return useBalanceContext();
}
