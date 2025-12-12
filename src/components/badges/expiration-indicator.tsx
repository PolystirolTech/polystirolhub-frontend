'use client';

/**
 * Expiration Indicator Component
 *
 * Shows expiration date and warning for temporary badges
 */

import { isBadgeExpiringSoon, formatBadgeDate } from '@/lib/badges/types';
import { cn } from '@/lib/utils';

interface ExpirationIndicatorProps {
	expiresAt: string | null | undefined;
	className?: string;
}

export function ExpirationIndicator({ expiresAt, className }: ExpirationIndicatorProps) {
	if (!expiresAt) return null;

	const isExpiringSoon = isBadgeExpiringSoon(expiresAt);
	const formattedDate = formatBadgeDate(expiresAt);

	return (
		<div className={cn('flex items-center gap-2 text-xs', className)}>
			<span className="text-white/60">Истекает: {formattedDate}</span>
			{isExpiringSoon && (
				<span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/20 px-2 py-0.5 text-orange-400">
					<span>⚠️</span>
					<span>Скоро истечет</span>
				</span>
			)}
		</div>
	);
}
