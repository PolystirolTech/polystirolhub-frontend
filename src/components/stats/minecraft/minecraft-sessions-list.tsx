'use client';

import { useEffect, useState } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftSessionResponse } from '@/lib/api/generated/models';
import { formatPlaytime } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsSection } from '@/components/stats/common/stats-section';

interface MinecraftSessionsListProps {
	playerUuid: string;
}

const PAGE_SIZE = 10;

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
		// Если это число, возвращаем его
		if (typeof obj === 'number') {
			return isFinite(obj) && !isNaN(obj) ? obj : null;
		}

		// Если это null или undefined, возвращаем null
		if (obj === null || obj === undefined) return null;

		// Если это строка, которая может быть числом, пытаемся преобразовать
		if (typeof obj === 'string') {
			const num = Number(obj);
			if (!isNaN(num) && isFinite(num)) return num;
			return null;
		}

		// Если это объект, пытаемся извлечь значение
		if (typeof obj === 'object') {
			// Проверяем поле value
			if ('value' in obj) {
				const value = (obj as { value: unknown }).value;
				if (typeof value === 'number' && isFinite(value) && !isNaN(value)) return value;
				if (typeof value === 'string') {
					const num = Number(value);
					if (!isNaN(num) && isFinite(num)) return num;
				}
			}
			// Если объект пустой или не содержит value, возвращаем null
			// SessionEnd1 может быть пустым объектом {}, что означает null
			if (Object.keys(obj).length === 0) return null;
		}

		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		// Если это строка, возвращаем её
		if (typeof obj === 'string' && obj.trim()) return obj.trim();

		// Если это null или undefined, возвращаем null
		if (obj === null || obj === undefined) return null;

		// Если это число, преобразуем в строку (на случай если пришло число)
		if (typeof obj === 'number') return String(obj);

		// Если это объект, пытаемся извлечь значение
		if (typeof obj === 'object') {
			// Проверяем поле value
			if ('value' in obj) {
				const value = (obj as { value: unknown }).value;
				if (typeof value === 'string' && value.trim()) return value.trim();
				if (typeof value === 'number') return String(value);
			}
			// Проверяем, может быть это объект с датой напрямую
			if ('date' in obj) {
				const date = (obj as { date: unknown }).date;
				if (typeof date === 'string' && date.trim()) return date.trim();
			}
		}

		return null;
	};

	const formatDate = (dateStr: string | null): string => {
		if (!dateStr) return 'Неизвестно';
		try {
			const date = new Date(dateStr + 'T00:00:00Z');
			return date.toLocaleDateString('ru-RU', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch {
			return dateStr;
		}
	};

	// Вычисляет длительность сессии в миллисекундах
	const calculateSessionDuration = (
		sessionStart: number | null,
		sessionEnd: number | null
	): number | null => {
		if (sessionStart === null || sessionEnd === null) return null;
		if (sessionEnd <= sessionStart) return null;
		return sessionEnd - sessionStart;
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
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Дата</th>
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
							// sessionEnd может быть числом напрямую или объектом SessionEnd1
							let sessionEnd: number | null = null;
							if (typeof session.sessionEnd === 'number') {
								sessionEnd = session.sessionEnd;
							} else {
								sessionEnd = getValue(session.sessionEnd);
							}

							const playtime = getValue(session.playtime);
							const mobKills = getValue(session.mobKills);
							const deaths = getValue(session.deaths);

							// Вычисляем длительность сессии: используем playtime если есть и больше 0, иначе вычисляем из timestamps
							const sessionDuration =
								playtime !== null && playtime > 0
									? playtime
									: calculateSessionDuration(sessionStart, sessionEnd);

							// Извлекаем дату сессии
							let sessionDate: string | null = null;
							if (typeof session.sessionDate === 'string' && session.sessionDate.trim()) {
								sessionDate = session.sessionDate.trim();
							} else if (session.sessionDate !== null && session.sessionDate !== undefined) {
								sessionDate = getStringValue(session.sessionDate);
							} else if (session && typeof session === 'object') {
								const rawSession = session as unknown as Record<string, unknown>;
								if ('session_date' in rawSession && typeof rawSession.session_date === 'string') {
									sessionDate = rawSession.session_date.trim();
								}
							}

							// Форматируем дату сессии
							const dateDisplay = sessionDate
								? formatDate(sessionDate)
								: sessionStart !== null && sessionStart > 0
									? new Date(sessionStart).toLocaleDateString('ru-RU', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})
									: 'Неизвестно';

							return (
								<tr key={session.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-3 px-4 text-sm text-white">{dateDisplay}</td>
									<td className="py-3 px-4 text-sm text-white">
										{sessionDuration !== null && sessionDuration > 0
											? formatPlaytime(sessionDuration)
											: sessionEnd === null || sessionEnd === 0
												? 'В игре'
												: 'Не завершена'}
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
