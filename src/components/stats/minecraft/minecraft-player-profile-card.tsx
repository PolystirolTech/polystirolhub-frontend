'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftPlayerProfile } from '@/lib/api/generated/models';
import { formatPlaytime, formatTimestamp, calculateKDRatio } from '@/lib/utils/stats-formatters';
import { getMinecraftPlatformName, getMinecraftAvatarUrl } from '@/lib/utils/minecraft-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';

interface MinecraftPlayerProfileCardProps {
	playerUuid: string;
}

export function MinecraftPlayerProfileCard({ playerUuid }: MinecraftPlayerProfileCardProps) {
	const [profile, setProfile] = useState<MinecraftPlayerProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadProfile() {
			try {
				setLoading(true);
				setError(null);
				const data = await minecraftStatsService.getPlayerProfile(playerUuid);
				setProfile(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль');
			} finally {
				setLoading(false);
			}
		}

		if (playerUuid) {
			loadProfile();
		}
	}, [playerUuid]);

	if (loading) {
		return <StatsLoading message="Загрузка профиля игрока..." />;
	}

	if (error) {
		return <StatsError message={error} onRetry={() => window.location.reload()} />;
	}

	if (!profile) {
		return <StatsEmpty message="Профиль игрока не найден" />;
	}

	const playerName = typeof profile.name === 'string' ? profile.name : 'Неизвестно';
	const totalPlaytime = typeof profile.totalPlaytime === 'number' ? profile.totalPlaytime : 0;
	const totalKills = typeof profile.totalKills === 'number' ? profile.totalKills : 0;
	const totalDeaths = typeof profile.totalDeaths === 'number' ? profile.totalDeaths : 0;
	const registered = typeof profile.registered === 'number' ? profile.registered : null;
	const lastSeen =
		profile.lastSeen && typeof profile.lastSeen === 'object' && 'value' in profile.lastSeen
			? (profile.lastSeen as { value: number }).value
			: null;
	const platform =
		profile.platform && typeof profile.platform === 'object' && 'value' in profile.platform
			? (profile.platform as { value: number }).value
			: null;

	const avatarUrl = getMinecraftAvatarUrl(playerName);
	const kdRatio = calculateKDRatio(totalKills, totalDeaths);

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
			<div className="flex items-center gap-6 mb-6">
				{/* Avatar */}
				<div className="h-24 w-24 overflow-hidden rounded-2xl shrink-0">
					{avatarUrl ? (
						<Image
							src={avatarUrl}
							alt={playerName}
							className="h-full w-full object-cover"
							width={96}
							height={96}
							unoptimized
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white bg-white/10">
							⛏️
						</div>
					)}
				</div>

				{/* Player Details */}
				<div className="flex-1">
					<h2 className="text-3xl font-bold text-white mb-2">{playerName}</h2>
					{platform !== null && (
						<div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1">
							<span className="text-sm text-white">{getMinecraftPlatformName(platform)}</span>
						</div>
					)}
					{registered && (
						<p className="text-sm text-white/60">Зарегистрирован: {formatTimestamp(registered)}</p>
					)}
					{lastSeen && (
						<p className="text-sm text-white/60">Последний вход: {formatTimestamp(lastSeen)}</p>
					)}
					{!lastSeen && <p className="text-sm text-white/60">Последний вход: Никогда</p>}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
					<div className="text-xs font-medium uppercase tracking-wider text-white/60 mb-1">K/D</div>
					<div className="text-2xl font-bold text-yellow-400">{kdRatio}</div>
				</div>
			</div>
		</div>
	);
}
