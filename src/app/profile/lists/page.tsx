'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth';
import { mediaListService } from '@/lib/lists/media-list-service';
import { MediaListItemModal } from '@/components/lists/media-list-item-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import type {
	MediaListItem,
	MediaType,
	MediaStatus,
	CreateMediaListItem,
	UpdateMediaListItem,
} from '@/lib/lists/types';

type ListTab = 'anime' | 'movies' | 'series' | 'games' | 'music';

const TAB_TO_MEDIA_TYPE: Record<ListTab, MediaType> = {
	anime: 'anime',
	movies: 'movie',
	series: 'series',
	games: 'game',
	music: 'album',
};

const TABS: { id: ListTab; label: string; icon: string }[] = [
	{ id: 'anime', label: 'Аниме', icon: '🎌' },
	{ id: 'movies', label: 'Фильмы', icon: '🎬' },
	{ id: 'series', label: 'Сериалы', icon: '📺' },
	{ id: 'games', label: 'Игры', icon: '🎮' },
	{ id: 'music', label: 'Музыка', icon: '🎵' },
];

const STATUS_LABELS: Record<MediaStatus, string> = {
	planned: 'Запланировано',
	in_progress: 'В процессе',
	completed: 'Завершено',
	dropped: 'Брошено',
};

const STATUS_COLORS: Record<MediaStatus, string> = {
	planned: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
	in_progress: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
	completed: 'bg-green-500/20 text-green-400 ring-green-500/30',
	dropped: 'bg-red-500/20 text-red-400 ring-red-500/30',
};

const PAGE_SIZE = 50;

export default function MyListsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<ListTab>('anime');
	const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
	const [items, setItems] = useState<MediaListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(false);

	// Tab counts cache
	const [tabCounts, setTabCounts] = useState<Partial<Record<ListTab, number>>>({});

	// Modals
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editItem, setEditItem] = useState<MediaListItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<MediaListItem | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, authLoading, router]);

	const loadItems = useCallback(
		async (tab: ListTab, status: MediaStatus | 'all', currentOffset: number) => {
			setLoading(true);
			setError(null);
			try {
				const data = await mediaListService.getMyList({
					media_type: TAB_TO_MEDIA_TYPE[tab],
					...(status !== 'all' && { status }),
					limit: PAGE_SIZE,
					offset: currentOffset,
				});
				setItems(currentOffset === 0 ? data : (prev) => [...prev, ...data]);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить список');
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	// Reload tab counts (all statuses, no limit filter for accuracy)
	const reloadTabCount = useCallback(async (tab: ListTab) => {
		try {
			const data = await mediaListService.getMyList({
				media_type: TAB_TO_MEDIA_TYPE[tab],
				limit: 200,
			});
			setTabCounts((prev) => ({ ...prev, [tab]: data.length }));
		} catch {
			// silent
		}
	}, []);

	// Initial load: fetch counts for all tabs
	useEffect(() => {
		if (!isAuthenticated) return;
		for (const tab of TABS) {
			reloadTabCount(tab.id);
		}
	}, [isAuthenticated, reloadTabCount]);

	// Reload list when tab or status filter changes
	useEffect(() => {
		if (!isAuthenticated) return;
		setOffset(0);
		loadItems(activeTab, statusFilter, 0);
	}, [activeTab, statusFilter, isAuthenticated, loadItems]);

	const handleTabChange = (tab: ListTab) => {
		setActiveTab(tab);
		setStatusFilter('all');
	};

	const handleLoadMore = () => {
		const nextOffset = offset + PAGE_SIZE;
		setOffset(nextOffset);
		loadItems(activeTab, statusFilter, nextOffset);
	};

	const handleAdd = async (data: CreateMediaListItem | UpdateMediaListItem) => {
		const created = await mediaListService.createItem(data as CreateMediaListItem);
		setItems((prev) => [created, ...prev]);
		reloadTabCount(activeTab);
	};

	const handleEdit = async (data: CreateMediaListItem | UpdateMediaListItem) => {
		if (!editItem) return;
		const updated = await mediaListService.updateItem(editItem.id, data as UpdateMediaListItem);
		setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
	};

	const handleDelete = async () => {
		if (!deleteItem) return;
		await mediaListService.deleteItem(deleteItem.id);
		setItems((prev) => prev.filter((it) => it.id !== deleteItem.id));
		reloadTabCount(activeTab);
	};

	const handleToggleFavorite = async (item: MediaListItem) => {
		setTogglingId(item.id);
		try {
			const updated = await mediaListService.toggleFavorite(item.id);
			setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
		} catch {
			// silent
		} finally {
			setTogglingId(null);
		}
	};

	const countByStatus = (status: MediaStatus) => items.filter((it) => it.status === status).length;

	if (authLoading) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
						<div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	const mediaType = TAB_TO_MEDIA_TYPE[activeTab];
	const isAlbum = mediaType === 'album';
	const isMovie = mediaType === 'movie';
	const displayedItems =
		statusFilter === 'all' ? items : items.filter((it) => it.status === statusFilter);

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Мои списки
					</h1>
					<p className="text-lg text-white/60">Аниме, фильмы, сериалы, игры и музыка</p>
				</div>

				{/* Type Tabs */}
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-2 mb-6">
					<div className="flex flex-wrap gap-1">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => handleTabChange(tab.id)}
								className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
									activeTab === tab.id
										? 'bg-primary text-white'
										: 'text-white/70 hover:bg-white/10 hover:text-white'
								}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
								{tabCounts[tab.id] !== undefined && (
									<span
										className={`text-xs px-1.5 py-0.5 rounded-md ${
											activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
										}`}
									>
										{tabCounts[tab.id]}
									</span>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Stats Row — not shown for albums (no status) */}
				{!isAlbum && (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
						{(Object.keys(STATUS_LABELS) as MediaStatus[]).map((status) => (
							<button
								key={status}
								onClick={() => setStatusFilter((prev) => (prev === status ? 'all' : status))}
								className={`glass-card border p-4 text-left transition-all cursor-pointer backdrop-blur-md ${
									statusFilter === status
										? 'bg-primary/20 border-white/30'
										: 'bg-[var(--color-secondary)]/65 border-white/10 hover:border-white/20'
								}`}
							>
								<div className="text-2xl font-bold text-white mb-1">
									{loading ? '…' : countByStatus(status)}
								</div>
								<div className="text-xs text-white/60">{STATUS_LABELS[status]}</div>
							</button>
						))}
					</div>
				)}

				{/* List */}
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-semibold text-white">
							{TABS.find((t) => t.id === activeTab)?.label}
							{statusFilter !== 'all' && (
								<span className="ml-2 text-sm font-normal text-white/50">
									· {STATUS_LABELS[statusFilter]}
								</span>
							)}
						</h2>
						<button
							onClick={() => setAddModalOpen(true)}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm font-medium transition-colors hover:bg-primary/30 cursor-pointer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M5 12h14" />
								<path d="M12 5v14" />
							</svg>
							Добавить
						</button>
					</div>

					{/* Error */}
					{error && (
						<div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-4">
							{error}
						</div>
					)}

					{/* Loading skeleton */}
					{loading && items.length === 0 && (
						<div className="flex justify-center py-16">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
						</div>
					)}

					{/* Empty state */}
					{!loading && displayedItems.length === 0 && (
						<div className="py-16 text-center">
							<p className="text-white/40 text-sm">Ничего не найдено</p>
						</div>
					)}

					{/* Items */}
					{displayedItems.length > 0 && (
						<div className="divide-y divide-white/5">
							{displayedItems.map((item) => (
								<div key={item.id} className="flex items-center gap-4 py-3 group">
									{/* Cover */}
									<div
										className={`shrink-0 rounded-md bg-white/10 overflow-hidden flex items-center justify-center text-white/20 text-xs ${isAlbum ? 'h-14 w-14' : 'h-20 w-14'}`}
									>
										{item.cover_url ? (
											<Image
												src={item.cover_url}
												alt={item.title}
												width={56}
												height={isAlbum ? 56 : 80}
												className="h-full w-full object-cover"
												unoptimized
											/>
										) : (
											TABS.find((t) => t.id === activeTab)?.icon
										)}
									</div>

									{/* Title + meta */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-1.5">
											{item.is_favorite && (
												<span className="text-yellow-400 text-xs shrink-0">★</span>
											)}
											<p className="text-sm font-medium text-white truncate">{item.title}</p>
											{!item.is_public && (
												<span className="text-white/30 text-xs shrink-0">🔒</span>
											)}
										</div>
										<p className="text-xs text-white/40">
											{!isAlbum &&
												!isMovie &&
												item.started_at &&
												new Date(item.started_at).toLocaleDateString('ru-RU')}
											{item.completed_at && !isAlbum && (
												<span>
													{isMovie ? '' : ' → '}
													{new Date(item.completed_at).toLocaleDateString('ru-RU')}
												</span>
											)}
											{item.play_time_hours != null && ` · ${item.play_time_hours} ч`}
											{item.status && !isAlbum && (
												<span className="ml-2">
													<span
														className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS_COLORS[item.status]}`}
													>
														{STATUS_LABELS[item.status]}
													</span>
												</span>
											)}
										</p>
										{item.comment && (
											<div className="relative mt-0.5 group/comment">
												<p className="text-xs text-white/50 line-clamp-2 italic cursor-default">
													{item.comment}
												</p>
												<div className="pointer-events-none absolute bottom-full left-0 mb-2 z-50 w-96 opacity-0 scale-95 group-hover/comment:opacity-100 group-hover/comment:scale-100 transition-all duration-200 ease-out glass-card bg-[var(--color-secondary)]/90 backdrop-blur-md border border-white/15 px-4 py-3 text-xs text-white/75 shadow-2xl leading-relaxed">
													{item.comment}
												</div>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										{/* Favorite toggle */}
										<button
											onClick={() => handleToggleFavorite(item)}
											disabled={togglingId === item.id}
											className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
												item.is_favorite
													? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
													: 'bg-white/5 text-white/40 hover:bg-white/10'
											}`}
											title={item.is_favorite ? 'Убрать из избранного' : 'В избранное'}
										>
											★
										</button>
										{/* Edit */}
										<button
											onClick={() => setEditItem(item)}
											className="h-7 w-7 flex items-center justify-center rounded-md bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
											title="Редактировать"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="13"
												height="13"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
											</svg>
										</button>
										{/* Delete */}
										<button
											onClick={() => setDeleteItem(item)}
											className="h-7 w-7 flex items-center justify-center rounded-md bg-red-500/5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
											title="Удалить"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="13"
												height="13"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M3 6h18" />
												<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
												<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
											</svg>
										</button>
									</div>

									{/* Rating as stars with halves (1-10 → 0.5-5 stars) */}
									<div
										className="shrink-0 flex gap-px"
										title={item.rating != null ? `Оценка: ${item.rating}/10` : ''}
									>
										{[1, 2, 3, 4, 5].map((star) => {
											const isFull = item.rating != null && item.rating >= star * 2;
											const isHalf = !isFull && item.rating != null && item.rating >= star * 2 - 1;
											const clipId = `list-star-${item.id}-${star}`;
											const starPath =
												'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
											return (
												<svg
													key={star}
													viewBox="0 0 24 24"
													width={18}
													height={18}
													className="block"
												>
													{isHalf && (
														<defs>
															<clipPath id={clipId}>
																<rect x="0" y="0" width="12" height="24" />
															</clipPath>
														</defs>
													)}
													<path d={starPath} fill="rgba(255,255,255,0.15)" />
													{(isFull || isHalf) && (
														<path
															d={starPath}
															fill="#facc15"
															clipPath={isHalf ? `url(#${clipId})` : undefined}
														/>
													)}
												</svg>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Load more */}
					{hasMore && (
						<div className="flex justify-center mt-6">
							<button
								onClick={handleLoadMore}
								disabled={loading}
								className="px-6 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
							>
								{loading ? 'Загрузка...' : 'Загрузить ещё'}
							</button>
						</div>
					)}
				</div>
			</main>

			<Footer />

			{/* Add modal */}
			<MediaListItemModal
				isOpen={addModalOpen}
				onClose={() => setAddModalOpen(false)}
				onSave={handleAdd}
				mediaType={mediaType}
			/>

			{/* Edit modal */}
			<MediaListItemModal
				isOpen={!!editItem}
				onClose={() => setEditItem(null)}
				onSave={handleEdit}
				mediaType={mediaType}
				item={editItem}
			/>

			{/* Delete confirmation */}
			<ConfirmationModal
				isOpen={!!deleteItem}
				onClose={() => setDeleteItem(null)}
				onConfirm={handleDelete}
				title="Удалить запись"
				message={`Удалить «${deleteItem?.title}» из списка? Это действие необратимо.`}
				confirmText="Удалить"
				isDangerous
			/>
		</div>
	);
}
