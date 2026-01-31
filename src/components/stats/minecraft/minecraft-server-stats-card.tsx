'use client';

import { useEffect, useState } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftServerStats } from '@/lib/api/generated/models';
import { formatTimestamp } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';

interface MinecraftServerStatsCardProps {
	serverId: string | number;
}

export function MinecraftServerStatsCard({ serverId }: MinecraftServerStatsCardProps) {
	const [stats, setStats] = useState<MinecraftServerStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadStats() {
			try {
				setLoading(true);
				setError(null);
				const data = await minecraftStatsService.getServerStats(serverId);
				// Если data === null, значит статистики нет (404), это нормально
				setStats(data);
			} catch (err) {
				// Проверяем, это 404 или другая ошибка
				if (
					err instanceof Error &&
					'status' in err &&
					(err as { status?: number }).status === 404
				) {
					// 404 - статистики нет, это нормально, просто не показываем компонент
					setStats(null);
				} else {
					// Другая ошибка - показываем её
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
			if (Object.keys(obj).length === 0) return null;
		}

		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		// Если это строка, возвращаем её
		if (typeof obj === 'string') return obj;

		// Если это объект с полем value
		if (obj && typeof obj === 'object' && 'value' in obj) {
			const value = (obj as { value: unknown }).value;
			if (typeof value === 'string') return value;
			// Преобразуем в строку, если это не null/undefined
			if (value !== null && value !== undefined) return String(value);
		}

		// Если это null или undefined, возвращаем null
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

	// Если статистики нет (404), просто не показываем компонент
	if (!stats) {
		return null;
	}

	// Если произошла другая ошибка, показываем её
	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
				<StatsError message={error} onRetry={() => window.location.reload()} />
			</div>
		);
	}

	const serverName = getStringValue(stats.name) || 'Неизвестный сервер';
	const totalPlayers = getValue(stats.totalPlayers) ?? 0;
	const totalSessions = getValue(stats.totalSessions) ?? 0;
	const averageTps = getValue(stats.averageTps);
	const currentPlayers = getValue(stats.currentPlayers);
	const lastUpdate = getValue(stats.lastUpdate);

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
				{currentPlayers !== null && (
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Онлайн сейчас
						</div>
						<div className="text-2xl font-bold text-yellow-400">{currentPlayers}</div>
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
