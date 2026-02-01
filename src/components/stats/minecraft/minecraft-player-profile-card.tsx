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
	serverId?: string | number;
}

export function MinecraftPlayerProfileCard({
	playerUuid,
	serverId,
}: MinecraftPlayerProfileCardProps) {
	const [profile, setProfile] = useState<MinecraftPlayerProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadProfile() {
			try {
				setLoading(true);
				setError(null);
				const data = await minecraftStatsService.getPlayerProfile(playerUuid, serverId);
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
	}, [playerUuid, serverId]);

	if (loading) {
		return <StatsLoading message="Загрузка профиля игрока..." />;
	}

	if (error) {
		return <StatsError message={error} onRetry={() => window.location.reload()} />;
	}

	if (!profile) {
		return <StatsEmpty message="Профиль игрока не найден" />;
	}

	const getTimestampValue = (obj: unknown): number | null => {
		// Если это число, возвращаем его
		if (typeof obj === 'number') {
			return isFinite(obj) && !isNaN(obj) && obj > 0 ? obj : null;
		}

		// Если это null или undefined, возвращаем null
		if (obj === null || obj === undefined) return null;

		// Если это строка, которая может быть числом, пытаемся преобразовать
		if (typeof obj === 'string') {
			const num = Number(obj);
			if (!isNaN(num) && isFinite(num) && num > 0) return num;
			return null;
		}

		// Если это объект, пытаемся извлечь значение
		if (typeof obj === 'object') {
			// Проверяем поле value
			if ('value' in obj) {
				const value = (obj as { value: unknown }).value;
				if (typeof value === 'number' && isFinite(value) && !isNaN(value) && value > 0)
					return value;
				if (typeof value === 'string') {
					const num = Number(value);
					if (!isNaN(num) && isFinite(num) && num > 0) return num;
				}
			}
			// Если объект пустой или не содержит value, возвращаем null
			if (Object.keys(obj).length === 0) return null;
		}

		return null;
	};

	const playerName = typeof profile.name === 'string' ? profile.name : 'Неизвестно';
	const totalPlaytime = typeof profile.totalPlaytime === 'number' ? profile.totalPlaytime : 0;
	const totalKills = typeof profile.totalKills === 'number' ? profile.totalKills : 0;
	const totalDeaths = typeof profile.totalDeaths === 'number' ? profile.totalDeaths : 0;
	const registered = typeof profile.registered === 'number' ? profile.registered : null;
	const lastSeen = getTimestampValue(profile.lastSeen);
	const platform =
		profile.platform && typeof profile.platform === 'object' && 'value' in profile.platform
			? (profile.platform as { value: number }).value
			: null;

	const avatarUrl = getMinecraftAvatarUrl(playerName);
	const kdRatio = calculateKDRatio(totalKills, totalDeaths);

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6">
			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
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
				<div className="flex-1 w-full text-center sm:text-left">
					<h2 className="text-3xl font-bold text-white mb-2">{playerName}</h2>
					{platform !== null && (
						<div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1">
							<span className="text-sm text-white">{getMinecraftPlatformName(platform)}</span>
						</div>
					)}
					{registered && (
						<p className="text-sm text-white/60">Зарегистрирован: {formatTimestamp(registered)}</p>
					)}
					{lastSeen !== null && lastSeen > 0 ? (
						<p className="text-sm text-white/60">Последний вход: {formatTimestamp(lastSeen)}</p>
					) : (
						<p className="text-sm text-white/60">Последний вход: Никогда</p>
					)}
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
