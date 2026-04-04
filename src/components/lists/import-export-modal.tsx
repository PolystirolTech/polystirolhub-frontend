'use client';

import { useEffect, useRef, useState } from 'react';
import { mediaListService, type ImportResult } from '@/lib/lists/media-list-service';

type MediaTabType = 'anime' | 'movies' | 'series';
type ImdbSection = 'ratings' | 'watchlist';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	username: string;
	mediaTab: MediaTabType;
	onImported: () => void;
}

const MODAL_TITLES: Record<MediaTabType, string> = {
	anime: 'Импорт / Экспорт аниме',
	movies: 'Импорт фильмов',
	series: 'Импорт сериалов',
};

export function ImportExportModal({ isOpen, onClose, username, mediaTab, onImported }: Props) {
	const [source, setSource] = useState<'letterboxd' | 'imdb'>('letterboxd');
	const [imdbSection, setImdbSection] = useState<ImdbSection>('ratings');

	const [importing, setImporting] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isOpen) {
			setImportResult(null);
			setError(null);
			setDragOver(false);
		}
	}, [isOpen]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && !importing) onClose();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [isOpen, importing, onClose]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	}, [isOpen]);

	if (!isOpen) return null;

	const isAnime = mediaTab === 'anime';

	const acceptedExt = isAnime
		? '.xml'
		: source === 'letterboxd'
			? '.zip'
			: '.csv';

	const handleExport = async () => {
		setExporting(true);
		setError(null);
		try {
			const blob = await mediaListService.exportAnime();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `animelist_${username}.xml`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка экспорта');
		} finally {
			setExporting(false);
		}
	};

	const handleFile = async (file: File) => {
		if (!file.name.toLowerCase().endsWith(acceptedExt)) {
			setError(`Поддерживается только ${acceptedExt.toUpperCase()} файл`);
			return;
		}
		setImporting(true);
		setError(null);
		setImportResult(null);
		try {
			let result: ImportResult;
			if (isAnime) {
				result = await mediaListService.importAnime(file);
			} else if (source === 'letterboxd') {
				result = await mediaListService.importLetterboxd(file);
			} else if (imdbSection === 'ratings') {
				result = await mediaListService.importImdbRatings(file);
			} else {
				result = await mediaListService.importImdbWatchlist(file);
			}
			setImportResult(result);
			onImported();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка импорта');
		} finally {
			setImporting(false);
		}
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
		e.target.value = '';
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFile(file);
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={importing ? undefined : onClose} />

			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative w-full max-w-md p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-white">{MODAL_TITLES[mediaTab]}</h2>
					<button
						onClick={importing ? undefined : onClose}
						disabled={importing}
						className="h-7 w-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M18 6 6 18" /><path d="m6 6 12 12" />
						</svg>
					</button>
				</div>

				{isAnime ? (
					<>
						{/* Anime Export */}
						<div className="mb-6 pb-6 border-b border-white/10">
							<h3 className="text-sm font-semibold text-white/80 mb-1">Экспорт</h3>
							<p className="text-xs text-white/40 mb-3">Скачать список в формате MAL/Shikimori XML</p>
							<button
								onClick={handleExport}
								disabled={exporting}
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{exporting ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
								) : (
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="7 10 12 15 17 10" />
										<line x1="12" y1="15" x2="12" y2="3" />
									</svg>
								)}
								{exporting ? 'Подготовка...' : 'Скачать XML'}
							</button>
						</div>

						{/* Anime Import */}
						<div>
							<h3 className="text-sm font-semibold text-white/80 mb-1">Импорт</h3>
							<p className="text-xs text-white/40 mb-3">
								Загрузить XML из MAL или Shikimori. Дубликаты по названию пропускаются.
							</p>
							<DropZone
								importing={importing}
								dragOver={dragOver}
								setDragOver={setDragOver}
								onDrop={handleDrop}
								onClick={() => fileInputRef.current?.click()}
								hint="animelist.xml"
								accept={acceptedExt}
							/>
						</div>
					</>
				) : (
					<>
						{/* Source tabs */}
						<div className="flex gap-1 p-1 rounded-lg bg-black/20 mb-5">
							{(['letterboxd', 'imdb'] as const).map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => { setSource(s); setImportResult(null); setError(null); }}
									className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
										source === s
											? 'bg-primary/20 text-primary'
											: 'text-white/50 hover:text-white'
									}`}
								>
									{s === 'letterboxd' ? 'Letterboxd' : 'IMDb'}
								</button>
							))}
						</div>

						{source === 'letterboxd' ? (
							<div>
								<p className="text-xs text-white/40 mb-4 leading-relaxed">
									Settings → Data → <span className="text-white/60">Export Your Data</span> → скачает ZIP.<br />
									Импортируются фильмы и вотчлист, оценки и рецензии.
								</p>
								<DropZone
									importing={importing}
									dragOver={dragOver}
									setDragOver={setDragOver}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
									hint="letterboxd-export.zip"
									accept={acceptedExt}
								/>
							</div>
						) : (
							<div>
								{/* IMDb sub-tabs */}
								<div className="flex gap-2 mb-4">
									{(['ratings', 'watchlist'] as const).map((sec) => (
										<button
											key={sec}
											type="button"
											onClick={() => { setImdbSection(sec); setImportResult(null); setError(null); }}
											className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
												imdbSection === sec
													? 'bg-white/10 border-white/20 text-white'
													: 'border-white/5 text-white/40 hover:text-white/70'
											}`}
										>
											{sec === 'ratings' ? 'Оценки' : 'Вотчлист'}
										</button>
									))}
								</div>

								<p className="text-xs text-white/40 mb-4 leading-relaxed">
									{imdbSection === 'ratings' ? (
										<>Your ratings → ••• → <span className="text-white/60">Export</span><br />Импортируются оценки и дата просмотра.</>
									) : (
										<>Watchlist → ••• → <span className="text-white/60">Export</span><br />Импортируются фильмы и сериалы со статусом «Запланировано».</>
									)}
								</p>
								<DropZone
									importing={importing}
									dragOver={dragOver}
									setDragOver={setDragOver}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
									hint={imdbSection === 'ratings' ? 'ratings.csv' : 'watchlist.csv'}
									accept={acceptedExt}
								/>
							</div>
						)}
					</>
				)}

				{/* Shared file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept={acceptedExt}
					onChange={handleFileInput}
					className="hidden"
				/>

				{/* Result */}
				{importResult && (
					<div className="mt-4 rounded-xl bg-black/20 border border-white/10 p-4 space-y-3">
						<p className="text-sm font-medium text-white">Импорт завершён</p>
						<div className="grid grid-cols-3 gap-3">
							<div className="text-center rounded-lg bg-green-500/10 border border-green-500/20 py-3">
								<p className="text-xl font-bold text-green-400">{importResult.imported}</p>
								<p className="text-xs text-green-400/70 mt-0.5">добавлено</p>
							</div>
							<div className="text-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 py-3">
								<p className="text-xl font-bold text-yellow-400">{importResult.skipped}</p>
								<p className="text-xs text-yellow-400/70 mt-0.5">пропущено</p>
							</div>
							<div className="text-center rounded-lg bg-red-500/10 border border-red-500/20 py-3">
								<p className="text-xl font-bold text-red-400">{importResult.errors.length}</p>
								<p className="text-xs text-red-400/70 mt-0.5">ошибок</p>
							</div>
						</div>
						{importResult.errors.length > 0 && (
							<div className="max-h-24 overflow-y-auto space-y-1">
								{importResult.errors.map((e, i) => (
									<p key={i} className="text-xs text-red-400/70">{e}</p>
								))}
							</div>
						)}
						<button
							onClick={() => setImportResult(null)}
							className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
						>
							Импортировать ещё
						</button>
					</div>
				)}

				{/* Error */}
				{error && (
					<div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
						{error}
					</div>
				)}
			</div>
		</div>
	);
}

function DropZone({
	importing,
	dragOver,
	setDragOver,
	onDrop,
	onClick,
	hint,
	accept,
}: {
	importing: boolean;
	dragOver: boolean;
	setDragOver: (v: boolean) => void;
	onDrop: (e: React.DragEvent) => void;
	onClick: () => void;
	hint: string;
	accept: string;
}) {
	return (
		<div
			onDragOver={(e) => { if (!importing) { e.preventDefault(); setDragOver(true); } }}
			onDragLeave={() => setDragOver(false)}
			onDrop={importing ? undefined : onDrop}
			onClick={importing ? undefined : onClick}
			className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
				importing
					? 'border-white/10 bg-black/10 cursor-not-allowed'
					: dragOver
						? 'border-primary/60 bg-primary/10 cursor-pointer'
						: 'border-white/15 bg-black/10 hover:border-white/30 hover:bg-black/20 cursor-pointer'
			}`}
		>
			{importing ? (
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
			) : (
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
			)}
			<div className="text-center">
				<p className="text-sm text-white/60">
					{importing ? 'Импортирую...' : `Перетащите ${accept.toUpperCase()} или нажмите`}
				</p>
				{!importing && <p className="text-xs text-white/30 mt-0.5">{hint}</p>}
			</div>
		</div>
	);
}
