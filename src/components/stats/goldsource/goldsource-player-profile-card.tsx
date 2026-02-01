'use client';

import { useEffect, useState } from 'react';
import { goldSourceStatsService } from '@/lib/stats/goldsource/goldsource-stats-service';
import type { GoldSourcePlayerProfile } from '@/lib/api/generated/models';
import { formatPlaytime, formatTimestamp, calculateKDRatio } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';

interface GoldSourcePlayerProfileCardProps {
	steamId: string;
}

export function GoldSourcePlayerProfileCard({ steamId }: GoldSourcePlayerProfileCardProps) {
	const [profile, setProfile] = useState<GoldSourcePlayerProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadProfile() {
			try {
				setLoading(true);
				setError(null);
				const data = await goldSourceStatsService.getPlayerProfile(steamId);
				setProfile(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль GoldSource');
			} finally {
				setLoading(false);
			}
		}

		if (steamId) {
			loadProfile();
		}
	}, [steamId]);

	if (loading) {
		return <StatsLoading message="Загрузка статистики GoldSource..." />;
	}

	if (error) {
		return <StatsError message={error} onRetry={() => window.location.reload()} />;
	}

	if (!profile) {
		return <StatsEmpty message="Статистика GoldSource не найдена" />;
	}

	const playerName = typeof profile.name === 'string' ? profile.name : 'Неизвестно';
	const totalPlaytime = typeof profile.totalPlaytime === 'number' ? profile.totalPlaytime : 0;
	const totalKills = typeof profile.totalKills === 'number' ? profile.totalKills : 0;
	const totalDeaths = typeof profile.totalDeaths === 'number' ? profile.totalDeaths : 0;
	const totalHeadshots = typeof profile.totalHeadshots === 'number' ? profile.totalHeadshots : 0;
	const registered = typeof profile.registered === 'number' ? profile.registered : null;
	const serversPlayed = Array.isArray(profile.serversPlayed) ? profile.serversPlayed : [];

	const kdRatio = calculateKDRatio(totalKills, totalDeaths);

	return (
		<div className="flex flex-col gap-6">
			{/* Profile Header Card */}
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
					{/* Avatar Placeholder */}
					<div className="h-24 w-24 overflow-hidden rounded-2xl shrink-0 bg-white/10 flex items-center justify-center text-4xl">
						🎮
					</div>

					{/* Player Details */}
					<div className="flex-1 w-full text-center sm:text-left">
						<h2 className="text-3xl font-bold text-white mb-2">{playerName}</h2>
						<div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1">
							<span className="text-sm text-blue-300 font-mono">Steam ID: {steamId}</span>
						</div>
						{registered && (
							<p className="text-sm text-white/60">
								Зарегистрирован: {formatTimestamp(registered)}
							</p>
						)}
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Время игры
						</div>
						<div className="text-2xl font-bold text-primary">{formatPlaytime(totalPlaytime)}</div>
					</div>
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Убийства
						</div>
						<div className="text-2xl font-bold text-green-400">{totalKills}</div>
					</div>
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Смерти
						</div>
						<div className="text-2xl font-bold text-red-400">{totalDeaths}</div>
					</div>
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							Хедшоты
						</div>
						<div className="text-2xl font-bold text-orange-400">{totalHeadshots}</div>
					</div>
					<div className="rounded-xl border border-white/10 p-4 bg-black/20">
						<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
							K/D
						</div>
						<div className="text-2xl font-bold text-yellow-400">{kdRatio}</div>
					</div>
				</div>
			</div>

			{/* Servers Played Card */}
			{serversPlayed.length > 0 && (
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
					<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
						<span>📡</span> Серверы
					</h3>
					<div className="flex flex-wrap gap-2">
						{serversPlayed.map((serverId, index) => (
							<div
								key={index}
								className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-mono"
							>
								{serverId}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
