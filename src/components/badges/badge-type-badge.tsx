'use client';

/**
 * Badge Type Badge Component
 *
 * Displays badge type with color and icon
 */

import { getBadgeTypeConfig, type BadgeTypeValue } from '@/lib/badges/types';
import { cn } from '@/lib/utils';

interface BadgeTypeBadgeProps {
	type: BadgeTypeValue | string | undefined;
	className?: string;
	showIcon?: boolean;
}

export function BadgeTypeBadge({ type, className, showIcon = true }: BadgeTypeBadgeProps) {
	const config = getBadgeTypeConfig(type);

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
				config.bgColor,
				config.color,
				className
			)}
		>
			{showIcon && <span>{config.icon}</span>}
			<span>{config.label}</span>
		</span>
	);
}
