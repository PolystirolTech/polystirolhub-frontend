'use client';

/**
 * User Badge Display Component
 *
 * Displays selected badge next to username
 */

import { BadgeImage } from './badge-image';
import { useState, useEffect } from 'react';
import { badgeService } from '@/lib/badges/badge-service';
import type { Badge } from '@/lib/api/generated';

interface UserBadgeDisplayProps {
	badgeId: string | null | undefined;
	size?: 'sm' | 'md';
	className?: string;
}

export function UserBadgeDisplay({ badgeId, size = 'sm', className }: UserBadgeDisplayProps) {
	const [badge, setBadge] = useState<Badge | null>(null);

	useEffect(() => {
		if (!badgeId) {
			return;
		}

		let cancelled = false;

		async function loadBadge() {
			if (!badgeId) return;
			try {
				const badgeData = await badgeService.getBadge(badgeId);
				if (!cancelled) {
					setBadge(badgeData);
				}
			} catch (error) {
				if (!cancelled) {
					console.error('Failed to load badge:', error);
					setBadge(null);
				}
			}
		}

		loadBadge();

		return () => {
			cancelled = true;
		};
	}, [badgeId]);

	if (!badgeId || !badge) return null;

	return (
		<BadgeImage
			src={badge.imageUrl || ''}
			alt={badge.name || 'Badge'}
			size={size}
			className={className}
			lazy={false}
		/>
	);
}
