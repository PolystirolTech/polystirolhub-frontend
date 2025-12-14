'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiConfig, type ActivityResponse } from '@/lib/api';
import { ActivityResponseFromJSON } from '@/lib/api/generated/models/ActivityResponse';
import { formatNotificationTime } from '@/lib/notifications/utils';

/**
 * Получить иконку для типа события активности
 */
function getActivityIcon(activityType: string | null | undefined): string {
	switch (activityType) {
		case 'badge_earned':
			return '🎖️';
		case 'achievement_unlocked':
			return '🏆';
		case 'quest_completed':
			return '✅';
		case 'level_up':
			return '⭐';
		case 'leaderboard_first_place':
			return '🥇';
		case 'leaderboard_changed':
			return '📊';
		case 'daily_quests_refreshed':
			return '🔄';
		case 'server_status_changed':
			return '🖥️';
		case 'new_user':
			return '👤';
		default:
			return '📢';
	}
}

export function ActivityWidget() {
	const [activities, setActivities] = useState<ActivityResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchActivities = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const basePath =
					apiConfig.basePath || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
				const url = new URL(`${basePath}/api/v1/activity`);
				url.searchParams.set('limit', '10');

				const response = await fetch(url.toString(), {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					cache: 'no-store',
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				if (!Array.isArray(data)) {
					throw new Error('Invalid response format: expected array');
				}

				// Преобразуем ответы API в типизированные объекты
				const activitiesList: ActivityResponse[] = data.map((item: unknown) =>
					ActivityResponseFromJSON(item)
				);

				setActivities(activitiesList);
			} catch (err) {
				console.error('Failed to fetch activities:', err);
				setError('Не удалось загрузить активность');
			} finally {
				setIsLoading(false);
			}
		};

		fetchActivities();

		// Автообновление каждые 60 секунд
		const interval = setInterval(fetchActivities, 60000);

		return () => clearInterval(interval);
	}, []);

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Активность</h3>
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Активность</h3>
				<p className="text-xs text-white/40">{error}</p>
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Активность</h3>
				<p className="text-xs text-white/40">Нет событий активности</p>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Активность</h3>
			<div className="space-y-2">
				{activities.map((activity) => {
					const icon = getActivityIcon(activity.activityType);
					const title = activity.title || 'Событие';
					const description =
						activity.description && typeof activity.description === 'string'
							? activity.description
							: null;
					const user = activity.user;
					const server = activity.server;
					const time = formatNotificationTime(activity.createdAt);

					const username = user?.username
						? typeof user.username === 'string'
							? user.username
							: String(user.username)
						: null;
					const avatarUrl = user?.avatar
						? typeof user.avatar === 'string'
							? user.avatar
							: null
						: null;
					const userLevel = user?.level
						? typeof user.level === 'number'
							? user.level
							: Number(user.level) || null
						: null;

					const serverName = server?.name
						? typeof server.name === 'string'
							? server.name
							: String(server.name)
						: null;
					const serverStatus = server?.status
						? typeof server.status === 'string'
							? server.status
							: String(server.status)
						: null;

					return (
						<div key={activity.id} className="rounded-lg bg-white/5 p-2 text-xs text-white/80">
							<div className="flex items-start gap-2">
								<span className="text-base flex-shrink-0">{icon}</span>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-white">{title}</p>
									{description && <p className="mt-1 text-white/60">{description}</p>}

									{/* Информация о пользователе */}
									{user && username && (
										<div className="mt-2 flex items-center gap-2">
											<div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary">
												{avatarUrl ? (
													<Image
														src={avatarUrl}
														alt={username}
														className="h-full w-full object-cover"
														width={20}
														height={20}
														unoptimized
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white">
														{username.substring(0, 2).toUpperCase()}
													</div>
												)}
											</div>
											<span className="text-white/80">{username}</span>
											{userLevel !== null && (
												<span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">
													Lv.{userLevel}
												</span>
											)}
										</div>
									)}

									{/* Информация о сервере */}
									{server && serverName && (
										<div className="mt-1.5 flex items-center gap-1.5">
											<span className="text-white/60">Сервер:</span>
											<span className="text-white/80">{serverName}</span>
											{serverStatus && (
												<span
													className={`rounded-full px-1.5 py-0.5 text-[9px] ${
														serverStatus === 'active'
															? 'bg-green-500/20 text-green-400'
															: serverStatus === 'maintenance'
																? 'bg-yellow-500/20 text-yellow-400'
																: 'bg-red-500/20 text-red-400'
													}`}
												>
													{serverStatus === 'active'
														? 'Работает'
														: serverStatus === 'maintenance'
															? 'Обслуживание'
															: 'Выключен'}
												</span>
											)}
										</div>
									)}

									<p className="mt-1.5 text-white/40">{time}</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
