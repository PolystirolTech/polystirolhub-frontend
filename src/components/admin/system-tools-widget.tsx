'use client';

import { useState } from 'react';
import { mediaListService } from '@/lib/lists/media-list-service';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export type EnrichResult = { processed: number; enriched: number; errors: number };

export function SystemToolsWidget() {
	const { user } = useAuth();
	const [isEnriching, setIsEnriching] = useState(false);
	const [result, setResult] = useState<EnrichResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	if (!user?.is_super_admin) return null;

	const handleEnrich = async () => {
		try {
			setIsEnriching(true);
			setError(null);
			setResult(null);
			const data = await mediaListService.enrich();
			setResult(data);
		} catch (err) {
			console.error('Enrichment failed:', err);
			setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении данных');
		} finally {
			setIsEnriching(false);
		}
	};

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white flex items-center gap-2">
				<span role="img" aria-label="tools">
					🛠️
				</span>
				Системные инструменты
			</h3>

			<div className="space-y-4">
				<div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-3">
					<h4 className="text-xs font-bold text-purple-400 mb-1">Обогащение медиаданных</h4>
					<p className="text-[10px] text-white/50 mb-3 leading-relaxed">
						Массовое обновление метаданных (названия, постеры, жанры) для всех элементов
						медиа-списков из внешних источников. Это может занять несколько минут.
					</p>
					<Button
						onClick={handleEnrich}
						disabled={isEnriching}
						className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none h-8 text-[11px] font-medium transition-all"
					>
						{isEnriching ? (
							<>
								<span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2 inline-block" />
								Выполняется...
							</>
						) : (
							'🚀 Запустить обогащение данных'
						)}
					</Button>
				</div>

				{result && (
					<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-[11px] text-green-400">
						<div className="flex items-center gap-2 mb-2 font-bold border-b border-green-400/20 pb-1">
							<span>✅</span>
							<span>Завершено</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div className="flex flex-col">
								<span className="text-white/40 text-[9px] uppercase tracking-wider">
									Обработано
								</span>
								<span className="text-sm font-bold">{result.processed}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-white/40 text-[9px] uppercase tracking-wider">Обновлено</span>
								<span className="text-sm font-bold">{result.enriched}</span>
							</div>
							<div className="flex flex-col col-span-2 mt-1">
								<span className="text-white/40 text-[9px] uppercase tracking-wider">Ошибок</span>
								<span className="text-sm font-bold text-red-400">{result.errors}</span>
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-[11px] text-red-300">
						<div className="flex items-center gap-2 mb-1 font-bold">
							<span>❌</span>
							<span>Ошибка</span>
						</div>
						<p className="leading-tight">{error}</p>
					</div>
				)}
			</div>
		</div>
	);
}
