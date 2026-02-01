'use client';

import { useEffect, useState } from 'react';
import { goldSourceStatsService } from '@/lib/stats/goldsource/goldsource-stats-service';
import type { GoldSourceServerStats } from '@/lib/api/generated/models';
import { formatTimestamp } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';

interface GoldSourceServerStatsCardProps {
	serverId: string | number;
}

export function GoldSourceServerStatsCard({ serverId }: GoldSourceServerStatsCardProps) {
	const [stats, setStats] = useState<GoldSourceServerStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadStats() {
			try {
				setLoading(true);
				setError(null);
				const data = await goldSourceStatsService.getServerStats(serverId);
				setStats(data);
			} catch (err) {
				if (
					err instanceof Error &&
					'message' in err &&
					(err.message.includes('404') || err.message.includes('not found'))
				) {
					setStats(null);
				} else {
					setError(err instanceof Error ? err.message : 'Не удалось загрузить статистику сервера');
				}
			} finally {
				setLoading(false);
			}
		}

		if (serverId) {
			loadStats();
		}
	}, [serverId]);

	const getValue = (obj: unknown): number | null => {
		if (typeof obj === 'number') {
			return isFinite(obj) && !isNaN(obj) ? obj : null;
		}
		if (obj === null || obj === undefined) return null;
		if (typeof obj === 'string') {
			const num = Number(obj);
			if (!isNaN(num) && isFinite(num)) return num;
			return null;
		}
		if (typeof obj === 'object') {
			if ('value' in obj) {
				const value = (obj as { value: unknown }).value;
				if (typeof value === 'number' && isFinite(value) && !isNaN(value)) return value;
				if (typeof value === 'string') {
					const num = Number(value);
					if (!isNaN(num) && isFinite(num)) return num;
				}
			}
			if (Object.keys(obj).length === 0) return null;
		}
		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		if (typeof obj === 'string') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj) {
			const value = (obj as { value: unknown }).value;
			if (typeof value === 'string') return value;
			if (value !== null && value !== undefined) return String(value);
		}
		if (obj === null || obj === undefined) return null;
		return null;
	};

	if (loading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
				<StatsLoading message="Загрузка статистики сервера..." />
			</div>
		);
	}

	if (!stats && !error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
				<StatsEmpty
					message="Статистика не найдена"
					description="Для этого сервера статистика пока не собрана."
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
				<StatsError message={error} onRetry={() => window.location.reload()} />
			</div>
		);
	}

	const serverName = getStringValue(stats!.name) || 'Неизвестный сервер';
	const totalPlayers = getValue(stats!.totalPlayers) ?? 0;
	const totalSessions = getValue(stats!.totalSessions) ?? 0;
	const averageFps = getValue(stats!.averageFps);
	const currentPlayers = getValue(stats!.currentPlayers);
	const currentMap = getStringValue(stats!.currentMap);
	const lastUpdate = getValue(stats!.lastUpdate);

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
			<h3 className="text-xl font-bold text-white mb-4">{serverName}</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
				<div className="rounded-xl border border-white/10 p-4 bg-black/20">
					<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
						Всего игроков
					</div>
					<div className="text-2xl font-bold text-primary">{totalPlayers}</div>
				</div>
				<div className="rounded-xl border border-white/10 p-4 bg-black/20">
					<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
						Всего сессий
					</div>
					<div className="text-2xl font-bold text-blue-400">{totalSessions}</div>
				</div>
				{averageFps !== null && (
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Средний FPS
						</div>
						<div className="text-2xl font-bold text-green-400">{averageFps.toFixed(1)}</div>
					</div>
				)}
				{currentPlayers !== null && (
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Онлайн сейчас
						</div>
						<div className="text-2xl font-bold text-yellow-400">{currentPlayers}</div>
					</div>
				)}
				{currentMap && (
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Текущая карта
						</div>
						<div className="text-sm font-medium text-white truncate">{currentMap}</div>
					</div>
				)}
				{lastUpdate !== null && lastUpdate > 0 && (
					<div className="rounded-xl border border-white/10 p-4 bg-black/20 sm:col-span-2">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							<span className="sm:hidden">Обновлено</span>
							<span className="hidden sm:inline">Последнее обновление</span>
						</div>
						<div className="text-sm font-medium text-white">{formatTimestamp(lastUpdate)}</div>
					</div>
				)}
			</div>
		</div>
	);
}
