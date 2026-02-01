'use client';

import { useEffect, useState } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftTopPlayer } from '@/lib/api/generated/models';
import { formatPlaytime, calculateKDRatio } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsSection } from '@/components/stats/common/stats-section';

interface MinecraftServerTopPlayersProps {
	serverId: string | number;
	limit?: number;
}

export function MinecraftServerTopPlayers({
	serverId,
	limit = 10,
}: MinecraftServerTopPlayersProps) {
	const [players, setPlayers] = useState<MinecraftTopPlayer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		async function loadTopPlayers() {
			try {
				setLoading(true);
				setError(null);
				setNotFound(false);
				const data = await minecraftStatsService.getServerTopPlayers(serverId, limit, 0);
				// Если массив пустой, возможно статистики нет (404)
				// Но это может быть и нормальная ситуация, поэтому проверяем через ошибку
				setPlayers(data);
			} catch (err) {
				// Проверяем, это 404 или другая ошибка
				if (
					err instanceof Error &&
					'status' in err &&
					(err as { status?: number }).status === 404
				) {
					// 404 - статистики нет, скрываем компонент
					setNotFound(true);
					setPlayers([]);
				} else {
					// Другая ошибка - показываем её
					setError(err instanceof Error ? err.message : 'Не удалось загрузить топ игроков');
				}
			} finally {
				setLoading(false);
			}
		}

		if (serverId) {
			loadTopPlayers();
		}
	}, [serverId, limit]);

	const getValue = (obj: unknown): number | null => {
		if (typeof obj === 'number') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj) return (obj as { value: number }).value;
		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		if (typeof obj === 'string') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj)
			return String((obj as { value: unknown }).value);
		return null;
	};

	// Если статистики нет (404), показываем пустое состояние
	if (notFound) {
		return (
			<StatsSection title="Топ игроков">
				<StatsEmpty
					message="Нет данных о топе игроков"
					description="Для этого сервера статистика пока не собрана."
				/>
			</StatsSection>
		);
	}

	if (loading) {
		return (
			<StatsSection title="Топ игроков">
				<StatsLoading message="Загрузка топа игроков..." />
			</StatsSection>
		);
	}

	// Если произошла другая ошибка, показываем её
	if (error) {
		return (
			<StatsSection title="Топ игроков">
				<StatsError message={error} onRetry={() => window.location.reload()} />
			</StatsSection>
		);
	}

	// Если игроков нет, но это не 404, показываем сообщение
	if (players.length === 0) {
		return (
			<StatsSection title="Топ игроков">
				<StatsEmpty message="Нет данных об игроках" />
			</StatsSection>
		);
	}

	return (
		<StatsSection title="Топ игроков">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Место</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Игрок</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Время игры</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Убийства</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Смерти</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">K/D</th>
						</tr>
					</thead>
					<tbody>
						{players.map((player, index) => {
							const playerName = getStringValue(player.name) || 'Неизвестно';
							const playtime = getValue(player.playtime) ?? 0;
							const kills = getValue(player.kills) ?? 0;
							const deaths = getValue(player.deaths) ?? 0;
							const kdRatio =
								getValue(player.kdRatio) ?? parseFloat(calculateKDRatio(kills, deaths));

							const rank = index + 1;
							const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

							return (
								<tr key={player.uuid} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-3 px-4 text-sm text-white">
										{rankEmoji} {rank}
									</td>
									<td className="py-3 px-4 text-sm font-medium text-white">{playerName}</td>
									<td className="py-3 px-4 text-sm text-white">{formatPlaytime(playtime)}</td>
									<td className="py-3 px-4 text-sm text-green-400">{kills}</td>
									<td className="py-3 px-4 text-sm text-red-400">{deaths}</td>
									<td className="py-3 px-4 text-sm text-yellow-400">{kdRatio.toFixed(2)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</StatsSection>
	);
}
