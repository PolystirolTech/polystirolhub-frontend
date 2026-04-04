'use client';

import { useEffect, useRef, useState } from 'react';
import { mediaListService } from '@/lib/lists/media-list-service';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	username: string;
	onImported: () => void;
}

type ImportResult = { imported: number; skipped: number; errors: number };

export function ImportExportModal({ isOpen, onClose, username, onImported }: Props) {
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
		}
	}, [isOpen]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) onClose();
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [isOpen, onClose]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	}, [isOpen]);

	if (!isOpen) return null;

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
		if (!file.name.endsWith('.xml')) {
			setError('Поддерживаются только XML файлы');
			return;
		}
		setImporting(true);
		setError(null);
		setImportResult(null);
		try {
			const result = await mediaListService.importAnime(file);
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
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative w-full max-w-md p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-white">Импорт / Экспорт аниме</h2>
					<button
						onClick={onClose}
						className="h-7 w-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
						</svg>
					</button>
				</div>

				{/* Export */}
				<div className="mb-6 pb-6 border-b border-white/10">
					<h3 className="text-sm font-semibold text-white/80 mb-1">Экспорт</h3>
					<p className="text-xs text-white/40 mb-3">
						Скачать список в формате MAL/Shikimori XML
					</p>
					<button
						onClick={handleExport}
						disabled={exporting}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{exporting ? (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
						) : (
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
								<polyline points="7 10 12 15 17 10"/>
								<line x1="12" y1="15" x2="12" y2="3"/>
							</svg>
						)}
						{exporting ? 'Подготовка...' : 'Скачать XML'}
					</button>
				</div>

				{/* Import */}
				<div>
					<h3 className="text-sm font-semibold text-white/80 mb-1">Импорт</h3>
					<p className="text-xs text-white/40 mb-3">
						Загрузить XML из MAL или Shikimori. Дубликаты по названию пропускаются.
					</p>

					{!importResult ? (
						<div
							onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
							onDragLeave={() => setDragOver(false)}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
							className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all cursor-pointer ${
								dragOver
									? 'border-primary/60 bg-primary/10'
									: 'border-white/15 bg-black/10 hover:border-white/30 hover:bg-black/20'
							}`}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".xml"
								onChange={handleFileInput}
								className="hidden"
							/>
							{importing ? (
								<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
							) : (
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
									<polyline points="17 8 12 3 7 8"/>
									<line x1="12" y1="3" x2="12" y2="15"/>
								</svg>
							)}
							<div className="text-center">
								<p className="text-sm text-white/60">
									{importing ? 'Импортирую...' : 'Перетащите XML или нажмите'}
								</p>
								{!importing && (
									<p className="text-xs text-white/30 mt-0.5">animelist.xml</p>
								)}
							</div>
						</div>
					) : (
						<div className="rounded-xl bg-black/20 border border-white/10 p-4 space-y-3">
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
									<p className="text-xl font-bold text-red-400">{importResult.errors}</p>
									<p className="text-xs text-red-400/70 mt-0.5">ошибок</p>
								</div>
							</div>
							<button
								onClick={() => setImportResult(null)}
								className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
							>
								Импортировать ещё
							</button>
						</div>
					)}
				</div>

				{error && (
					<div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
						{error}
					</div>
				)}
			</div>
		</div>
	);
}
