'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mediaListService } from '@/lib/lists/media-list-service';
import type { MediaType } from '@/lib/lists/types';

const ITEMS: { mediaType: MediaType; label: string; icon: string }[] = [
	{ mediaType: 'anime', label: 'Аниме', icon: '🎌' },
	{ mediaType: 'movie', label: 'Фильмы', icon: '🎬' },
	{ mediaType: 'series', label: 'Сериалы', icon: '📺' },
	{ mediaType: 'game', label: 'Игры', icon: '🎮' },
	{ mediaType: 'album', label: 'Музыка', icon: '🎵' },
];

export function ListsPreview() {
	const [counts, setCounts] = useState<Partial<Record<MediaType, number>>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const results = await Promise.allSettled(
					ITEMS.map((item) =>
						mediaListService.getMyList({ media_type: item.mediaType, limit: 200 })
					)
				);
				const next: Partial<Record<MediaType, number>> = {};
				results.forEach((result, i) => {
					if (result.status === 'fulfilled') {
						next[ITEMS[i].mediaType] = result.value.length;
					} else {
						console.warn(`Failed to load ${ITEMS[i].mediaType}:`, result.reason);
						next[ITEMS[i].mediaType] = 0;
					}
				});
				setCounts(next);
			} catch (err) {
				console.error('Lists preview fatal error:', err);
				// Fallback: set all to 0
				const fallback: Partial<Record<MediaType, number>> = {};
				ITEMS.forEach((item) => {
					fallback[item.mediaType] = 0;
				});
				setCounts(fallback);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
			{ITEMS.map((item) => (
				<Link
					key={item.mediaType}
					href="/profile/lists"
					className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
				>
					<span className="text-2xl">{item.icon}</span>
					<span className="text-lg font-bold text-white">{counts[item.mediaType] ?? 0}</span>
					<span className="text-xs text-white/60">{item.label}</span>
				</Link>
			))}
		</div>
	);
}
