'use client';

/**
 * Badges Preview Component
 *
 * Shows last 5 badges in square cards
 */

import { useEffect, useState } from 'react';
import { badgeService } from '@/lib/badges/badge-service';
import { BadgeImage } from './badge-image';
import Link from 'next/link';
import type { UserBadgeWithBadge } from '@/lib/api/generated';

export function BadgesPreview() {
	const [badges, setBadges] = useState<UserBadgeWithBadge[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadBadges() {
			try {
				const data = await badgeService.getMyBadges();
				// Берем последние 5 бэджиков
				const lastBadges = data.slice(0, 5);
				setBadges(lastBadges);
			} catch (err) {
				console.error('Failed to load badges:', err);
			} finally {
				setIsLoading(false);
			}
		}

		loadBadges();
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
			</div>
		);
	}

	if (badges.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-white/60 mb-4">У вас пока нет бэджиков</p>
				<Link
					href="/profile/badges"
					className="text-sm text-primary hover:text-primary/80 transition-colors underline"
				>
					Посмотреть все бэджики
				</Link>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-10 gap-3">
			{badges.map((item) => {
				const description =
					typeof item.badge.description === 'string'
						? item.badge.description
						: String(item.badge.description || '');
				const hasDescription = description.trim().length > 0;

				return (
					<div key={item.id} className="relative group">
						<Link
							href="/profile/badges"
							className="glass-card bg-white/5 border border-white/10 rounded-lg p-3 aspect-square flex flex-col items-center justify-center gap-2 hover:border-white/20 hover:scale-105 transition-all cursor-pointer"
						>
							<BadgeImage src={item.badge.imageUrl || ''} alt={item.badge.name || ''} size="lg" />
							<p className="text-xs font-medium text-white text-center line-clamp-2">
								{item.badge.name}
							</p>
						</Link>
						{hasDescription && (
							<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-[200px] text-center whitespace-normal">
								{description}
								<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
