'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { mediaListService } from '@/lib/lists/media-list-service';
import { proxyImageUrl } from '@/lib/utils';
import type {
	MediaListItem,
	MediaType,
	MediaStatus,
	CreateCustomMediaListItem,
	CreateMediaListItem,
	UpdateMediaListItem,
	SearchResult,
} from '@/lib/lists/types';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSave: (
		data: CreateMediaListItem | CreateCustomMediaListItem | UpdateMediaListItem,
		options?: { mode?: 'custom' | 'search' }
	) => Promise<void>;
	mediaType: MediaType;
	item?: MediaListItem | null;
}

const STATUS_OPTIONS: { value: MediaStatus; label: string }[] = [
	{ value: 'planned', label: 'Запланировано' },
	{ value: 'in_progress', label: 'В процессе' },
	{ value: 'completed', label: 'Завершено' },
	{ value: 'dropped', label: 'Брошено' },
];

const isAlbum = (t: MediaType) => t === 'album';
const isGame = (t: MediaType) => t === 'game';
const isMovie = (t: MediaType) => t === 'movie';
const SEARCH_DEBOUNCE_MS = 300;
type EntryMode = 'search' | 'custom';
const CUSTOM_YEAR_MIN = 1800;
const CUSTOM_YEAR_MAX = 2099;
const FIELD_LABELS: Record<string, string> = {
	media_type: 'Тип',
	title: 'Название',
	year: 'Год',
	cover_url: 'Обложка',
	status: 'Статус',
	rating: 'Оценка',
	comment: 'Комментарий',
	genres: 'Жанры',
	is_public: 'Публичность',
	is_favorite: 'Избранное',
	started_at: 'Дата начала',
	completed_at: 'Дата завершения',
	play_time_hours: 'Часов',
};

function formatValidationError(raw?: string | null) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed
				.map((err) => {
					const loc = Array.isArray(err.loc) ? err.loc : [];
					const fieldKey = loc[loc.length - 1] ?? loc[1] ?? 'error';
					const label = FIELD_LABELS[fieldKey] ?? fieldKey;
					return `${label}: ${err.msg}`;
				})
				.join('. ');
		}
	} catch {
		// ignore
	}
	return raw;
}

export function MediaListItemModal({ isOpen, onClose, onSave, mediaType, item }: Props) {
	const isEdit = !!item;

	// Read-only metadata (from search result)
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
	const [entryMode, setEntryMode] = useState<EntryMode>('search');
	const [customTitle, setCustomTitle] = useState('');
	const [customYear, setCustomYear] = useState('');
	const [customCoverUrl, setCustomCoverUrl] = useState('');
	const [customDescription, setCustomDescription] = useState('');
	const [customGenres, setCustomGenres] = useState('');

	const [editTitle, setEditTitle] = useState('');
	const [editCoverUrl, setEditCoverUrl] = useState('');
	const [editDescription, setEditDescription] = useState('');

	const [coverPreview, setCoverPreview] = useState<string | null>(null);
	const [coverUploading, setCoverUploading] = useState(false);
	const coverInputRef = useRef<HTMLInputElement>(null);

	// Editable fields
	const [status, setStatus] = useState<MediaStatus | ''>('');
	const [rating, setRating] = useState('');
	const [comment, setComment] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [startedAt, setStartedAt] = useState('');
	const [completedAt, setCompletedAt] = useState('');
	const [playTimeHours, setPlayTimeHours] = useState('');

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hoverRating, setHoverRating] = useState<number | null>(null);

	// Search
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searching, setSearching] = useState(false);
	const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();

	useEffect(() => {
		if (isOpen) {
			if (isEdit) {
				// Edit mode: fill editable fields only
				setEditTitle(item?.title ?? '');
				setEditCoverUrl(item?.cover_url ?? '');
				setEditDescription(item?.description ?? '');
				setCoverPreview(null);
				setStatus(item?.status ?? '');
				setRating(item?.rating != null ? String(item.rating) : '');
				setComment(item?.comment ?? '');
				setIsPublic(item?.is_public ?? true);
				setIsFavorite(item?.is_favorite ?? false);
				setStartedAt(item?.started_at ? item.started_at.slice(0, 10) : '');
				setCompletedAt(item?.completed_at ? item.completed_at.slice(0, 10) : '');
				setPlayTimeHours(item?.play_time_hours != null ? String(item.play_time_hours) : '');
				setSelectedResult(null);
				setSearchQuery('');
				setSearchResults([]);
			} else {
				// Add mode: reset all
				setSelectedResult(null);
				setEntryMode('search');
				setCustomTitle('');
				setCustomYear('');
				setCustomCoverUrl('');
				setCustomDescription('');
				setCustomGenres('');
				setCoverPreview(null);
				setStatus('');
				setRating('');
				setComment('');
				setIsPublic(true);
				setIsFavorite(false);
				setStartedAt('');
				setCompletedAt('');
				setPlayTimeHours('');
				setSearchQuery('');
				setSearchResults([]);
			}
			setError(null);
		}
	}, [isOpen, item, isEdit]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) onClose();
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	// Debounced search (add mode only)
	useEffect(() => {
		if (searchDebounce) clearTimeout(searchDebounce);

		if (isEdit || !searchQuery.trim()) {
			setSearchResults([]);
			return;
		}

		const timeout = setTimeout(async () => {
			setSearching(true);
			try {
				const results = await mediaListService.search(searchQuery, mediaType);
				setSearchResults(results.filter((r) => !!r.external_id));
			} catch {
				setSearchResults([]);
			} finally {
				setSearching(false);
			}
		}, SEARCH_DEBOUNCE_MS);

		setSearchDebounce(timeout);

		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [searchQuery, isEdit, mediaType]);

	useEffect(() => {
		if (!isEdit && entryMode === 'custom') {
			setSelectedResult(null);
			setSearchResults([]);
			setSearchQuery('');
		}
	}, [entryMode, isEdit]);

	if (!isOpen) return null;

	const handleSelectSearchResult = (result: SearchResult) => {
		setSelectedResult(result);
		setSearchQuery('');
		setSearchResults([]);
	};

	const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const preview = URL.createObjectURL(file);
		setCoverPreview(preview);
		setCoverUploading(true);
		setError(null);
		try {
			const { url } = await mediaListService.uploadCover(file);
			if (isEdit) {
				setEditCoverUrl(url);
			} else {
				setCustomCoverUrl(url);
			}
		} catch (err) {
			const e = err as Error;
			setError(`Ошибка загрузки обложки: ${e.message}`);
			setCoverPreview(null);
		} finally {
			setCoverUploading(false);
			if (coverInputRef.current) coverInputRef.current.value = '';
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const ratingNum = rating ? Number(rating) : null;
		const playTimeNum = playTimeHours ? Number(playTimeHours) : null;

		const submitCreate = async (
			payload: CreateMediaListItem | CreateCustomMediaListItem,
			options?: { mode?: 'custom' | 'search' }
		) => {
			try {
				setSaving(true);
				setError(null);
				await onSave(payload, options);
				onClose();
			} catch (err) {
				const e = err as Error & { status?: number };
				console.error('[MediaListItemModal] Create error:', e, 'Status:', e.status);
				if (e.status === 409) {
					setError('Эта запись уже в вашем списке');
				} else {
					const formatted = formatValidationError(e.message) ?? e.message ?? 'Не удалось добавить';
					setError(formatted);
				}
			} finally {
				setSaving(false);
			}
		};

		if (isEdit) {
			// Update existing item
			const data: UpdateMediaListItem = {
				...(item?.is_custom && {
					title: editTitle.trim() || undefined,
					cover_url: editCoverUrl || null,
					description: editDescription.trim() || null,
				}),
				...(!isAlbum(mediaType) && { status: (status as MediaStatus) || null }),
				rating: ratingNum,
				comment: comment.trim() || null,
				is_public: isPublic,
				is_favorite: isFavorite,
				started_at: startedAt || null,
				...(!isAlbum(mediaType) && { completed_at: completedAt || null }),
				...(isGame(mediaType) && { play_time_hours: playTimeNum }),
			};

			try {
				setSaving(true);
				setError(null);
				await onSave(data);
				onClose();
			} catch (err) {
				const e = err as Error & { status?: number };
				console.error('[MediaListItemModal] Update error:', e);
				const formatted = formatValidationError(e.message) ?? e.message ?? 'Не удалось сохранить';
				setError(formatted);
			} finally {
				setSaving(false);
			}

			return;
		}

		if (entryMode === 'search') {
			if (!selectedResult) {
				setError('Выберите запись из поиска');
				return;
			}
			if (!selectedResult.external_id) {
				setError('Не удалось определить идентификатор записи');
				return;
			}

			const data: CreateMediaListItem = {
				media_type: mediaType,
				external_id: selectedResult.external_id,
				...(!isAlbum(mediaType) && { status: (status as MediaStatus) || null }),
				rating: ratingNum,
				comment: comment.trim() || null,
				is_public: isPublic,
				is_favorite: isFavorite,
				started_at: startedAt || null,
				...(!isAlbum(mediaType) && { completed_at: completedAt || null }),
				...(isGame(mediaType) && { play_time_hours: playTimeNum }),
			};

			await submitCreate(data, { mode: 'search' });
			return;
		}

		const trimmedTitle = customTitle.trim();
		if (!trimmedTitle) {
			setError('Укажите название');
			return;
		}

		const yearInput = customYear.trim();
		const parsedYear = yearInput ? Number(yearInput) : undefined;
		const yearValue =
			parsedYear !== undefined && !Number.isNaN(parsedYear) ? parsedYear : undefined;
		if (yearInput) {
			if (!Number.isInteger(parsedYear ?? NaN)) {
				setError('Год должен быть целым числом');
				return;
			}
			if (yearValue !== undefined && (yearValue < CUSTOM_YEAR_MIN || yearValue > CUSTOM_YEAR_MAX)) {
				setError(`Год должен быть от ${CUSTOM_YEAR_MIN} до ${CUSTOM_YEAR_MAX}`);
				return;
			}
		}
		const coverUrlValue = customCoverUrl.trim();
		if (coverUrlValue && !coverUrlValue.startsWith('/')) {
			try {
				new URL(coverUrlValue);
			} catch {
				setError('Ссылка на обложку некорректна');
				return;
			}
		}
		const genresList = customGenres
			.split(',')
			.map((g) => g.trim())
			.filter(Boolean);

		const trimmedDescription = customDescription.trim();
		const data: CreateCustomMediaListItem = {
			media_type: mediaType,
			title: trimmedTitle,
			...(yearValue !== undefined ? { year: yearValue } : {}),
			...(coverUrlValue ? { cover_url: coverUrlValue } : {}),
			...(trimmedDescription ? { description: trimmedDescription } : {}),
			...(!isAlbum(mediaType) && { status: (status as MediaStatus) || null }),
			rating: ratingNum,
			comment: comment.trim() || null,
			is_public: isPublic,
			is_favorite: isFavorite,
			started_at: startedAt || null,
			...(!isAlbum(mediaType) && { completed_at: completedAt || null }),
			...(isGame(mediaType) && { play_time_hours: playTimeNum }),
			...(genresList.length > 0 ? { genres: genresList } : {}),
		};

		await submitCreate(data, { mode: 'custom' });
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative w-full max-w-lg p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
				<h2 className="mb-5 text-xl font-bold text-white">
					{isEdit ? 'Редактировать' : 'Добавить запись'}
				</h2>

				<input
					ref={coverInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					className="hidden"
					onChange={handleCoverFileChange}
				/>

				{/* Edit mode: title + cover / info block */}
				{isEdit && (
					<div className="mb-6 pb-6 border-b border-white/10 space-y-3">
						{item?.is_custom ? (
							<>
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">
										Название
										<span className="text-red-400 ml-1">*</span>
									</label>
									<input
										type="text"
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">Обложка</label>
									<div className="flex items-center gap-3">
										{(coverPreview || editCoverUrl) && (
											<div
												className={`shrink-0 rounded overflow-hidden ${isAlbum(mediaType) ? 'h-10 w-10' : 'h-14 w-10'}`}
											>
												<Image
													src={proxyImageUrl(coverPreview ?? editCoverUrl)!}
													alt="Обложка"
													width={40}
													height={isAlbum(mediaType) ? 40 : 56}
													className="h-full w-full object-cover"
													unoptimized
												/>
											</div>
										)}
										<button
											type="button"
											disabled={coverUploading}
											onClick={() => coverInputRef.current?.click()}
											className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
										>
											{coverUploading ? 'Загрузка...' : editCoverUrl ? 'Заменить' : 'Загрузить'}
										</button>
										{editCoverUrl && !coverUploading && (
											<button
												type="button"
												onClick={() => {
													setEditCoverUrl('');
													setCoverPreview(null);
												}}
												className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
											>
												Удалить
											</button>
										)}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">Описание</label>
									<textarea
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										rows={2}
										placeholder="Описание..."
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
									/>
								</div>
							</>
						) : (
							<div className="flex gap-4">
								{item?.cover_url && (
									<div
										className={`shrink-0 rounded overflow-hidden shadow-lg border border-white/5 ${isAlbum(mediaType) ? 'h-16 w-16' : 'h-24 w-16'}`}
									>
										<Image
											src={proxyImageUrl(item.cover_url)!}
											alt={item.title}
											width={64}
											height={isAlbum(mediaType) ? 64 : 96}
											className="h-full w-full object-cover"
											unoptimized
										/>
									</div>
								)}
								<div className="flex-1 min-w-0 flex flex-col justify-center">
									<p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
										Название
									</p>
									<p className="text-lg font-bold text-white line-clamp-2 leading-tight">
										{item?.title}
									</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Search / custom section — only for add mode */}
				{!isEdit && (
					<div className="mb-6 pb-6 border-b border-white/10 space-y-4">
						<div className="flex gap-1 p-1 rounded-lg bg-black/20">
							<button
								type="button"
								onClick={() => setEntryMode('search')}
								className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
									entryMode === 'search'
										? 'bg-primary/20 text-primary'
										: 'text-white/50 hover:text-white'
								}`}
							>
								Поиск в базе
							</button>
							<button
								type="button"
								onClick={() => setEntryMode('custom')}
								className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
									entryMode === 'custom'
										? 'bg-primary/20 text-primary'
										: 'text-white/50 hover:text-white'
								}`}
							>
								Своя запись
							</button>
						</div>

						{entryMode === 'search' ? (
							!selectedResult ? (
								<>
									<label className="block text-sm font-medium text-white/70 mb-2">
										🔍 Поиск в базах данных
										<span className="text-red-400 ml-1">*</span>
									</label>
									<div className="relative">
										<input
											type="text"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder="Введите название..."
											className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
											autoFocus
										/>
										{searching && (
											<div className="absolute right-3 top-2">
												<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
											</div>
										)}
									</div>

									{/* Search results */}
									{searchResults.length > 0 && (
										<div className="mt-3 max-h-64 overflow-y-auto space-y-2">
											{searchResults.map((result, i) => (
												<button
													key={i}
													type="button"
													onClick={() => handleSelectSearchResult(result)}
													className="w-full text-left p-3 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-white/20 transition-all flex gap-3 group"
												>
													{result.cover_url && (
														<div
															className={`shrink-0 rounded overflow-hidden ${isAlbum(mediaType) ? 'h-8 w-8' : 'h-12 w-8'}`}
														>
															<Image
																src={proxyImageUrl(result.cover_url)!}
																alt={result.title}
																width={32}
																height={isAlbum(mediaType) ? 32 : 48}
																className="h-full w-full object-cover"
																unoptimized
															/>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
															{result.title}
														</p>
														{result.genres && result.genres.length > 0 && (
															<p className="text-xs text-white/50">
																{result.genres.slice(0, 2).join(', ')}
															</p>
														)}
														<div className="flex gap-2 mt-1 text-xs text-white/40">
															{result.year && <span>Год: {result.year}</span>}
															{result.source_rating && <span>⭐ {result.source_rating}</span>}
														</div>
													</div>
												</button>
											))}
										</div>
									)}

									{searchQuery && !searching && searchResults.length === 0 && (
										<p className="mt-3 text-sm text-white/40">Ничего не найдено</p>
									)}
								</>
							) : (
								<div className="p-3 rounded-lg bg-black/30 border border-primary/30">
									<div className="flex gap-3">
										{selectedResult.cover_url && (
											<div
												className={`shrink-0 rounded overflow-hidden ${isAlbum(mediaType) ? 'h-12 w-12' : 'h-16 w-12'}`}
											>
												<Image
													src={proxyImageUrl(selectedResult.cover_url)!}
													alt={selectedResult.title}
													width={48}
													height={isAlbum(mediaType) ? 48 : 64}
													className="h-full w-full object-cover"
													unoptimized
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white">{selectedResult.title}</p>
											{selectedResult.genres && selectedResult.genres.length > 0 && (
												<p className="text-xs text-white/50 mt-1">
													{selectedResult.genres.join(', ')}
												</p>
											)}
											<div className="flex gap-2 mt-1 text-xs text-white/40">
												{selectedResult.year && <span>{selectedResult.year}</span>}
												{selectedResult.source_rating && (
													<span>⭐ {selectedResult.source_rating}</span>
												)}
											</div>
											{selectedResult.description && (
												<p className="text-xs text-white/60 mt-2 line-clamp-2">
													{selectedResult.description}
												</p>
											)}
										</div>
									</div>
									<button
										type="button"
										onClick={() => setSelectedResult(null)}
										className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
									>
										Выбрать другое...
									</button>
								</div>
							)
						) : (
							<div className="grid gap-3">
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">
										Название
										<span className="text-red-400 ml-1">*</span>
									</label>
									<input
										type="text"
										value={customTitle}
										onChange={(e) => setCustomTitle(e.target.value)}
										placeholder="Мой любимый фильм"
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
									/>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-white/70 mb-1">Год</label>
										<input
											type="number"
											min={1800}
											max={2099}
											value={customYear}
											onChange={(e) => setCustomYear(e.target.value)}
											placeholder="2023"
											className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-white/70 mb-1">Обложка</label>
										<div className="flex items-center gap-2">
											{(coverPreview || customCoverUrl) && (
												<div
													className={`shrink-0 rounded overflow-hidden ${isAlbum(mediaType) ? 'h-8 w-8' : 'h-10 w-7'}`}
												>
													<Image
														src={proxyImageUrl(coverPreview ?? customCoverUrl)!}
														alt="Обложка"
														width={28}
														height={isAlbum(mediaType) ? 28 : 40}
														className="h-full w-full object-cover"
														unoptimized
													/>
												</div>
											)}
											<button
												type="button"
												disabled={coverUploading}
												onClick={() => coverInputRef.current?.click()}
												className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-left"
											>
												{coverUploading
													? 'Загрузка...'
													: customCoverUrl
														? 'Заменить...'
														: 'Выбрать файл...'}
											</button>
										</div>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">Описание</label>
									<textarea
										value={customDescription}
										onChange={(e) => setCustomDescription(e.target.value)}
										rows={2}
										placeholder="Краткое описание..."
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">Жанры</label>
									<input
										type="text"
										value={customGenres}
										onChange={(e) => setCustomGenres(e.target.value)}
										placeholder="Drama, Adventure"
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
									/>
									<p className="text-xs text-white/40 mt-1">Разделяйте через запятую</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{/* Status — not for album */}
					{!isAlbum(mediaType) && (
						<div>
							<label className="block text-sm font-medium text-white/70 mb-1">Статус</label>
							<select
								value={status}
								onChange={(e) => setStatus(e.target.value as MediaStatus | '')}
								className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
							>
								<option value="">Не указан</option>
								{STATUS_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Rating */}
					<div>
						<label className="block text-sm font-medium text-white/70 mb-2">Оценка</label>
						<div className="flex gap-0.5" onMouseLeave={() => setHoverRating(null)}>
							{[1, 2, 3, 4, 5].map((star) => {
								const fullValue = star * 2;
								const halfValue = star * 2 - 1;
								const displayVal = hoverRating !== null ? hoverRating : Number(rating) || 0;
								const isFull = displayVal >= fullValue;
								const isHalf = !isFull && displayVal >= halfValue;
								const clipId = `star-half-${star}`;
								const starPath =
									'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

								return (
									<div key={star} className="relative" style={{ width: 34, height: 34 }}>
										{/* Left half → odd (half star) */}
										<button
											type="button"
											className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
											onMouseEnter={() => setHoverRating(halfValue)}
											onClick={() => setRating(String(halfValue))}
											title={`${halfValue}/10`}
										/>
										{/* Right half → even (full star) */}
										<button
											type="button"
											className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
											onMouseEnter={() => setHoverRating(fullValue)}
											onClick={() => setRating(String(fullValue))}
											title={`${fullValue}/10`}
										/>
										<svg
											viewBox="0 0 24 24"
											width={34}
											height={34}
											className="block pointer-events-none"
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
									</div>
								);
							})}
						</div>
						<p className="text-xs text-white/50 mt-2">
							{hoverRating !== null ? hoverRating : rating || '—'}/10
						</p>
					</div>

					{/* Dates */}
					{!isAlbum(mediaType) && (
						<div className={`grid gap-3 ${isMovie(mediaType) ? 'grid-cols-1' : 'grid-cols-2'}`}>
							{!isMovie(mediaType) && (
								<div>
									<label className="block text-sm font-medium text-white/70 mb-1">Начато</label>
									<input
										type="date"
										value={startedAt}
										onChange={(e) => setStartedAt(e.target.value)}
										className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
									/>
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-white/70 mb-1">
									{isMovie(mediaType) ? 'Дата просмотра' : 'Завершено'}
								</label>
								<input
									type="date"
									value={completedAt}
									onChange={(e) => setCompletedAt(e.target.value)}
									className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
								/>
							</div>
						</div>
					)}

					{/* Play time — only for game */}
					{isGame(mediaType) && (
						<div>
							<label className="block text-sm font-medium text-white/70 mb-1">Часов сыграно</label>
							<input
								type="number"
								min={0}
								step={0.5}
								value={playTimeHours}
								onChange={(e) => setPlayTimeHours(e.target.value)}
								placeholder="0"
								className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
							/>
						</div>
					)}

					{/* Comment */}
					<div>
						<label className="block text-sm font-medium text-white/70 mb-1">Комментарий</label>
						<textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={3}
							placeholder="Ваши впечатления..."
							className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
						/>
					</div>

					{/* Toggles */}
					<div className="flex gap-6">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
								className="rounded border-white/20 bg-black/20 text-primary focus:ring-primary"
							/>
							<span className="text-sm text-white/70">Публичный</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={isFavorite}
								onChange={(e) => setIsFavorite(e.target.checked)}
								className="rounded border-white/20 bg-black/20 text-primary focus:ring-primary"
							/>
							<span className="text-sm text-white/70">Избранное</span>
						</label>
					</div>

					{/* Error */}
					{error && (
						<div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
							{error}
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-3 justify-end pt-1">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={saving || (!isEdit && entryMode === 'search' && !selectedResult)}
							className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
