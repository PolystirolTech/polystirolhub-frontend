'use client';

import { useEffect, useState } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftSessionResponse } from '@/lib/api/generated/models';
import { formatTimestamp, formatPlaytime } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsSection } from '@/components/stats/common/stats-section';

interface MinecraftSessionsListProps {
	playerUuid: string;
}

const PAGE_SIZE = 20;

export function MinecraftSessionsList({ playerUuid }: MinecraftSessionsListProps) {
	const [sessions, setSessions] = useState<MinecraftSessionResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		async function loadSessions() {
			try {
				setLoading(true);
				setError(null);
				const offset = (page - 1) * PAGE_SIZE;
				const data = await minecraftStatsService.getPlayerSessions(playerUuid, PAGE_SIZE, offset);
				setSessions(data);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить сессии');
			} finally {
				setLoading(false);
			}
		}

		if (playerUuid) {
			loadSessions();
		}
	}, [playerUuid, page]);

	const getValue = (obj: unknown): number | null => {
		if (typeof obj === 'number') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj) return (obj as { value: number }).value;
		return null;
	};

	if (loading && sessions.length === 0) {
		return (
			<StatsSection title="История сессий">
				<StatsLoading message="Загрузка сессий..." />
			</StatsSection>
		);
	}

	if (error && sessions.length === 0) {
		return (
			<StatsSection title="История сессий">
				<StatsError message={error} onRetry={() => setPage(1)} />
			</StatsSection>
		);
	}

	if (sessions.length === 0) {
		return (
			<StatsSection title="История сессий">
				<StatsEmpty message="Нет данных о сессиях" />
			</StatsSection>
		);
	}

	return (
		<StatsSection title="История сессий">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Начало</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Конец</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Время игры</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">
								Убийства мобов
							</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Смерти</th>
						</tr>
					</thead>
					<tbody>
						{sessions.map((session) => {
							const sessionStart = getValue(session.sessionStart);
							const sessionEnd = getValue(session.sessionEnd);
							const playtime = getValue(session.playtime);
							const mobKills = getValue(session.mobKills);
							const deaths = getValue(session.deaths);

							return (
								<tr key={session.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-3 px-4 text-sm text-white">
										{sessionStart ? formatTimestamp(sessionStart) : 'Неизвестно'}
									</td>
									<td className="py-3 px-4 text-sm text-white">
										{sessionEnd ? formatTimestamp(sessionEnd) : 'В игре'}
									</td>
									<td className="py-3 px-4 text-sm text-white">
										{playtime ? formatPlaytime(playtime) : 'Не завершена'}
									</td>
									<td className="py-3 px-4 text-sm text-white">{mobKills ?? 0}</td>
									<td className="py-3 px-4 text-sm text-white">{deaths ?? 0}</td>
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
