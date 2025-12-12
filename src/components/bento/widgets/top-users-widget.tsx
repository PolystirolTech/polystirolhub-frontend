'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { LeaderboardPlayer } from '@/lib/api/generated';
import { UsersApi, apiConfig } from '@/lib/api';
import { UserBadgeDisplay } from '@/components/badges/user-badge-display';

export function TopUsersWidget() {
	const [topUsers, setTopUsers] = useState<LeaderboardPlayer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const usersApi = new UsersApi(apiConfig);
				const response = await usersApi.getLeaderboardApiV1UsersLeaderboardGet();
				// API возвращает массив LeaderboardPlayer
				// Используем FromJSON для правильного маппинга snake_case -> camelCase
				const players = Array.isArray(response)
					? response.map((item: any) => {
							// Если это уже объект с camelCase, используем как есть
							// Иначе конвертируем из snake_case
							if (item.selectedBadgeId !== undefined) {
								return item;
							}
							// Проверяем snake_case вариант
							const badgeId = item.selected_badge_id || item.selectedBadgeId || null;
							return {
								...item,
								selectedBadgeId: badgeId,
							};
						})
					: [];
				setTopUsers(players);
			} catch (err) {
				console.error('Failed to fetch leaderboard:', err);
				setError('Не удалось загрузить топ игроков');
			} finally {
				setIsLoading(false);
			}
		};

		fetchLeaderboard();
	}, []);

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Топ игроков</h3>
			{isLoading ? (
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			) : error ? (
				<p className="text-xs text-white/40">{error}</p>
			) : topUsers.length === 0 ? (
				<p className="text-xs text-white/40">Нет данных</p>
			) : (
				<div className="space-y-2">
					{topUsers.map((user, index) => {
						const username = String(user.username || 'Без имени');
						const avatarUrl = typeof user.avatar === 'string' ? user.avatar : null;
						return (
							<div
								key={user.id || index}
								className="flex items-center justify-between rounded-lg bg-white/5 p-2"
							>
								<div className="flex items-center gap-2 min-w-0 flex-1">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
										{index + 1}
									</span>
									<div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary">
										{avatarUrl ? (
											<Image
												src={avatarUrl}
												alt={username}
												className="h-full w-full object-cover"
												width={24}
												height={24}
												unoptimized
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
												{username.substring(0, 2).toUpperCase()}
											</div>
										)}
									</div>
									<div className="flex items-center gap-1.5 min-w-0">
										<span className="text-sm font-medium text-white truncate">{username}</span>
										{(() => {
											// Получаем badgeId, проверяя оба варианта (camelCase и snake_case)
											const badgeId =
												user.selectedBadgeId || (user as any).selected_badge_id || null;
											if (!badgeId) return null;
											const badgeIdString =
												typeof badgeId === 'string' ? badgeId : String(badgeId || '');
											if (
												!badgeIdString ||
												badgeIdString === 'null' ||
												badgeIdString === 'undefined'
											) {
												return null;
											}
											return <UserBadgeDisplay badgeId={badgeIdString} size="sm" />;
										})()}
									</div>
								</div>
								<div className="ml-2 flex shrink-0 items-center justify-center rounded-full bg-primary/20 px-2 py-0.5 text-[9px] text-primary">
									{user.level ?? 0}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
