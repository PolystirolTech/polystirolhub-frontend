'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { mediaListService } from '@/lib/lists/media-list-service';
import { proxyImageUrl } from '@/lib/utils';
import type {
	MediaListItem,
	MediaListStats,
	MediaType,
	MediaStatus,
	SortBy,
	SortOrder,
} from '@/lib/lists/types';

interface Props {
	username: string;
}

const MEDIA_TABS: { type: MediaType; label: string; icon: string }[] = [
	{ type: 'anime', label: 'Аниме', icon: '🎌' },
	{ type: 'series', label: 'Сериалы', icon: '📺' },
	{ type: 'movie', label: 'Фильмы', icon: '🎬' },
	{ type: 'game', label: 'Игры', icon: '🎮' },
	{ type: 'album', label: 'Музыка', icon: '🎵' },
];

const STATUS_LABELS: Record<MediaStatus, string> = {
	planned: 'Запланировано',
	in_progress: 'В процессе',
	completed: 'Завершено',
	dropped: 'Брошено',
};

const STATUS_COLORS: Record<MediaStatus, string> = {
	planned: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
	in_progress: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30',
	completed: 'bg-green-500/20 text-green-300 ring-green-500/30',
	dropped: 'bg-red-500/20 text-red-300 ring-red-500/30',
};

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
	{ value: 'created_at', label: 'По дате добавления' },
	{ value: 'rating', label: 'По оценке' },
	{ value: 'title', label: 'По названию' },
	{ value: 'completed_at', label: 'По дате завершения' },
	{ value: 'updated_at', label: 'По обновлению' },
];

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 24;

function StarRating({ rating }: { rating: number }) {
	const filled = rating / 2;
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }, (_, i) => {
				const full = i + 1 <= filled;
				const half = !full && i + 0.5 < filled;
				return (
					<svg key={i} viewBox="0 0 24 24" width={12} height={12} className="shrink-0">
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							fill={full || half ? '#facc15' : 'rgba(255,255,255,0.15)'}
							opacity={half ? 0.5 : 1}
						/>
					</svg>
				);
			})}
			<span className="text-xs text-white/50 ml-1">{rating}/10</span>
		</div>
	);
}

function MediaCard({ item }: { item: MediaListItem }) {
	const isAlbum = item.media_type === 'album';
	const coverAspect = isAlbum ? 'aspect-square' : 'aspect-[2/3]';
	const titleRef = useRef<HTMLParagraphElement>(null);
	const [isTitleTruncated, setIsTitleTruncated] = useState(false);
	const commentRef = useRef<HTMLParagraphElement>(null);
	const [isCommentTruncated, setIsCommentTruncated] = useState(false);

	useEffect(() => {
		const checkTruncation = () => {
			if (titleRef.current) {
				setIsTitleTruncated(titleRef.current.scrollHeight > titleRef.current.clientHeight);
			}
			if (commentRef.current) {
				setIsCommentTruncated(commentRef.current.scrollHeight > commentRef.current.clientHeight);
			}
		};

		checkTruncation();
		window.addEventListener('resize', checkTruncation);
		return () => window.removeEventListener('resize', checkTruncation);
	}, [item.title, item.comment]);

	return (
		<div className="group flex flex-col rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 relative hover:z-50">
			<div className={`relative w-full ${coverAspect} overflow-hidden rounded-t-xl bg-black/30`}>
				{item.cover_url ? (
					<Image
						src={proxyImageUrl(item.cover_url)!}
						alt={item.title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						unoptimized
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-3xl opacity-30">
						{MEDIA_TABS.find((t) => t.type === item.media_type)?.icon ?? '📄'}
					</div>
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

				{item.is_favorite && (
					<div className="absolute top-2 right-2 text-yellow-400 drop-shadow text-sm">★</div>
				)}

				{item.status && (
					<div className="absolute bottom-2 left-2 right-2">
						<span
							className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS_COLORS[item.status]}`}
						>
							{STATUS_LABELS[item.status]}
						</span>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-1 p-3 flex-1">
				<div className="relative group/title">
					<p
						ref={titleRef}
						className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover/title:text-primary transition-colors cursor-default"
					>
						{item.title}
					</p>
					{isTitleTruncated && (
						<div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[60] w-max max-w-[200px] opacity-0 scale-95 group-hover/title:opacity-100 group-hover/title:scale-100 transition-all duration-200 ease-out glass-card bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/15 px-3 py-2 text-xs text-white/90 shadow-2xl text-center">
							{item.title}
							{/* Tooltip Arrow */}
							<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-white/15" />
							<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1.5px] border-[7px] border-transparent border-t-[var(--color-secondary)]" />
						</div>
					)}
				</div>
				{item.year && <p className="text-xs text-white/40">{item.year}</p>}
				{item.rating != null && item.rating > 0 && <StarRating rating={item.rating} />}
				{item.genres && item.genres.length > 0 && (
					<p className="text-[10px] text-white/40 line-clamp-1">
						{item.genres.slice(0, 3).join(', ')}
					</p>
				)}
				{item.play_time_hours != null && item.play_time_hours > 0 && (
					<p className="text-[10px] text-white/40">{item.play_time_hours} ч.</p>
				)}
			</div>

			{item.comment && (
				<div className="px-3 pb-3 border-t border-white/10 pt-2 rounded-b-xl">
					<div className="relative group/comment">
						<p
							ref={commentRef}
							className="text-xs text-white/60 italic line-clamp-3 cursor-default"
						>
							{item.comment}
						</p>
						{isCommentTruncated && (
							<div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[60] w-64 opacity-0 scale-95 group-hover/comment:opacity-100 group-hover/comment:scale-100 transition-all duration-200 ease-out glass-card bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/15 px-3 py-2.5 text-xs text-white/90 shadow-2xl leading-relaxed text-center">
								{item.comment}
								{/* Tooltip Arrow */}
								<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-white/15" />
								<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1.5px] border-[7px] border-transparent border-t-[var(--color-secondary)]" />
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export function UserMediaList({ username }: Props) {
	// Tab stats — loaded once, used for tab badges and status filter counts
	const [tabStats, setTabStats] = useState<Partial<Record<MediaType, MediaListStats>> | null>(null);

	// Active filters
	const [activeTab, setActiveTab] = useState<MediaType>('anime');
	const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
	const [sortBy, setSortBy] = useState<SortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [showFavorites, setShowFavorites] = useState(false);

	// Items state
	const [items, setItems] = useState<MediaListItem[]>([]);
	const [itemsLoading, setItemsLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [offset, setOffset] = useState(0);

	const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Load stats for all tabs once
	useEffect(() => {
		async function loadStats() {
			const results = await Promise.allSettled(
				MEDIA_TABS.map((tab) => mediaListService.getPublicStats(username, tab.type))
			);
			const stats: Partial<Record<MediaType, MediaListStats>> = {};
			results.forEach((result, i) => {
				if (result.status === 'fulfilled') {
					stats[MEDIA_TABS[i].type] = result.value;
				}
			});
			setTabStats(stats);

			// Auto-select first non-empty tab
			const first = MEDIA_TABS.find((t) => (stats[t.type]?.total ?? 0) > 0);
			if (first) setActiveTab(first.type);
		}
		loadStats();
	}, [username]);

	// Debounce search input
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchQuery]);

	// Load items whenever tab or filters change — always resets to page 1
	useEffect(() => {
		if (tabStats === null) return;
		setOffset(0);
		setItems([]);
		setHasMore(false);
		let cancelled = false;
		async function loadItems() {
			setItemsLoading(true);
			try {
				const data = await mediaListService.getPublicList(username, {
					media_type: activeTab,
					...(statusFilter !== 'all' ? { status: statusFilter } : {}),
					sort_by: sortBy,
					order: sortOrder,
					...(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}),
					...(showFavorites ? { is_favorite: true } : {}),
					limit: PAGE_SIZE,
					offset: 0,
				});
				if (!cancelled) {
					setItems(data);
					setHasMore(data.length === PAGE_SIZE);
				}
			} catch {
				if (!cancelled) {
					setItems([]);
					setHasMore(false);
				}
			} finally {
				if (!cancelled) setItemsLoading(false);
			}
		}
		loadItems();
		return () => {
			cancelled = true;
		};
	}, [
		username,
		activeTab,
		statusFilter,
		showFavorites,
		sortBy,
		sortOrder,
		debouncedQuery,
		tabStats,
	]);

	async function loadMore() {
		const nextOffset = offset + PAGE_SIZE;
		setLoadingMore(true);
		try {
			const data = await mediaListService.getPublicList(username, {
				media_type: activeTab,
				...(statusFilter !== 'all' ? { status: statusFilter } : {}),
				sort_by: sortBy,
				order: sortOrder,
				...(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}),
				...(showFavorites ? { is_favorite: true } : {}),
				limit: PAGE_SIZE,
				offset: nextOffset,
			});
			setItems((prev) => [...prev, ...data]);
			setHasMore(data.length === PAGE_SIZE);
			setOffset(nextOffset);
		} catch {
			// keep existing items
		} finally {
			setLoadingMore(false);
		}
	}

	// Don't render until stats loaded
	if (tabStats === null) return null;

	const totalAll = MEDIA_TABS.reduce((sum, t) => sum + (tabStats[t.type]?.total ?? 0), 0);
	if (totalAll === 0) return null;

	const currentStats = tabStats[activeTab];
	const byStatus = currentStats?.by_status ?? ({} as Record<MediaStatus, number>);

	return (
		<div>
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10">
				{/* Media type tabs */}
				<div className="flex overflow-x-auto border-b border-white/10 scrollbar-none rounded-t-lg">
					{MEDIA_TABS.map((tab) => {
						const total = tabStats[tab.type]?.total ?? 0;
						if (total === 0) return null;
						const isActive = activeTab === tab.type;
						return (
							<button
								key={tab.type}
								onClick={() => {
									setActiveTab(tab.type);
									setStatusFilter('all');
									setSearchQuery('');
								}}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
									isActive
										? 'border-primary text-primary'
										: 'border-transparent text-white/50 hover:text-white/80'
								}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
								<span
									className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}
								>
									{total}
								</span>
							</button>
						);
					})}
				</div>

				<div className="p-4 sm:p-6 space-y-4">
					{/* Search + sort row */}
					<div className="flex flex-col sm:flex-row gap-3">
						{/* Search */}
						<div className="relative flex-1">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
								width={14}
								height={14}
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2.5}
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.35-4.35" />
							</svg>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Поиск..."
								className="w-full rounded-lg bg-black/20 border border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
								>
									✕
								</button>
							)}
						</div>

						{/* Sort by */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortBy)}
							className="rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>

						{/* Order toggle */}
						<button
							onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
							title={sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
							className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
						>
							<svg
								width={14}
								height={14}
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2.5}
								className={`transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
							>
								<path d="M12 5v14M5 12l7 7 7-7" />
							</svg>
							{sortOrder === 'desc' ? 'Убыв.' : 'Возр.'}
						</button>
					</div>

					{/* Status filters */}
					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => setShowFavorites(!showFavorites)}
							className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
								showFavorites
									? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-inset ring-yellow-500/30'
									: 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
							}`}
						>
							<span className="text-sm">★</span>
							Избранное
						</button>

						<div className="w-px h-4 bg-white/10 mx-1" />

						<button
							onClick={() => setStatusFilter('all')}
							className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
								statusFilter === 'all'
									? 'bg-primary text-white'
									: 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
							}`}
						>
							Все <span className="ml-1 opacity-60">{currentStats?.total ?? 0}</span>
						</button>
						{(Object.entries(byStatus) as [MediaStatus, number][])
							.filter(([, count]) => count > 0)
							.map(([status, count]) => (
								<button
									key={status}
									onClick={() => setStatusFilter(status)}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
										statusFilter === status
											? 'bg-primary text-white'
											: 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
									}`}
								>
									{STATUS_LABELS[status]} <span className="ml-1 opacity-60">{count}</span>
								</button>
							))}
					</div>

					{/* Grid */}
					{itemsLoading ? (
						<div className="flex justify-center py-12">
							<div className="h-7 w-7 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
						</div>
					) : items.length === 0 ? (
						<div className="py-10 text-center text-white/40 text-sm">
							{debouncedQuery ? 'Ничего не найдено' : 'Здесь пусто'}
						</div>
					) : (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
								{items.map((item) => (
									<MediaCard key={item.id} item={item} />
								))}
							</div>
							{hasMore && (
								<div className="flex justify-center pt-4">
									<button
										onClick={loadMore}
										disabled={loadingMore}
										className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
									>
										{loadingMore ? (
											<span className="flex items-center gap-2">
												<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/80 inline-block" />
												Загрузка...
											</span>
										) : (
											'Загрузить ещё'
										)}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
