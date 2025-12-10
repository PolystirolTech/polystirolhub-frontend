'use client';

import { useEffect, useState } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftKillResponse } from '@/lib/api/generated/models';
import { formatTimestamp } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsSection } from '@/components/stats/common/stats-section';

interface MinecraftKillsListProps {
	playerUuid: string;
}

const PAGE_SIZE = 20;

export function MinecraftKillsList({ playerUuid }: MinecraftKillsListProps) {
	const [kills, setKills] = useState<MinecraftKillResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		async function loadKills() {
			try {
				setLoading(true);
				setError(null);
				const offset = (page - 1) * PAGE_SIZE;
				const data = await minecraftStatsService.getPlayerKills(playerUuid, PAGE_SIZE, offset);
				setKills(data);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить убийства');
			} finally {
				setLoading(false);
			}
		}

		if (playerUuid) {
			loadKills();
		}
	}, [playerUuid, page]);

	const getValue = (obj: unknown): unknown => {
		if (obj === null || obj === undefined) return null;
		if (typeof obj === 'string' || typeof obj === 'number') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj) return (obj as { value: unknown }).value;
		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		const value = getValue(obj);
		return value !== null ? String(value) : null;
	};

	if (loading && kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsLoading message="Загрузка убийств..." />
			</StatsSection>
		);
	}

	if (error && kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsError message={error} onRetry={() => setPage(1)} />
			</StatsSection>
		);
	}

	if (kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsEmpty message="Нет данных об убийствах" />
			</StatsSection>
		);
	}

	return (
		<StatsSection title="История убийств">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Жертва</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Оружие</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Дата</th>
						</tr>
					</thead>
					<tbody>
						{kills.map((kill) => {
							const victimName = getStringValue(kill.victimName) || 'Неизвестно';
							const weapon = getStringValue(kill.weapon) || 'Неизвестно';
							const dateValue = getValue(kill.date);
							const date = typeof dateValue === 'number' ? dateValue : null;

							return (
								<tr key={kill.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-3 px-4 text-sm text-white">{victimName}</td>
									<td className="py-3 px-4 text-sm text-white">{weapon}</td>
									<td className="py-3 px-4 text-sm text-white">
										{date ? formatTimestamp(date) : 'Неизвестно'}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-4">
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}
					className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Назад
				</button>
				<span className="text-sm text-white/60">Страница {page}</span>
				<button
					onClick={() => setPage((p) => p + 1)}
					disabled={!hasMore}
					className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Вперед
				</button>
			</div>
		</StatsSection>
	);
}
