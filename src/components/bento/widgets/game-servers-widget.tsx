'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gameService } from '@/lib/game/game-service';
import type { GameServerPublic, ServerStatusResponse } from '@/lib/api/generated';
import { calculateSeasonCountdown } from '@/lib/utils/season-countdown';

interface ServerWithStatus extends GameServerPublic {
	mcStatus?: ServerStatusResponse;
}

export function GameServersWidget() {
	const [servers, setServers] = useState<ServerWithStatus[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		async function loadServers() {
			try {
				// Показываем загрузку только при первой загрузке
				if (isInitialLoad) {
					setIsLoading(true);
				}
				setError(null);

				// Загружаем все серверы
				const allServers = await gameService.getGameServers();

				// Получаем статусы для всех серверов параллельно (только для active)
				const serversWithStatus = await Promise.allSettled(
					allServers.map(async (server) => {
						if (!server.id) return { ...server, mcStatus: undefined };

						// Не запрашиваем статус для disabled/maintenance
						const serverStatus = server.status as string;
						if (serverStatus === 'disabled' || serverStatus === 'maintenance') {
							return { ...server, mcStatus: undefined };
						}

						try {
							const mcStatus = await gameService.getGameServerStatus(String(server.id));
							return { ...server, mcStatus };
						} catch {
							// Если статус не получен, продолжаем без него
							return { ...server, mcStatus: undefined };
						}
					})
				);

				// Извлекаем успешные результаты
				const successfulServers = serversWithStatus
					.filter(
						(result): result is PromiseFulfilledResult<ServerWithStatus> =>
							result.status === 'fulfilled'
					)
					.map((result) => result.value);

				// Сортируем по онлайну (playersOnline) по убыванию
				const sortedServers = successfulServers.sort((a, b) => {
					const aOnline = a.mcStatus?.playersOnline ?? 0;
					const bOnline = b.mcStatus?.playersOnline ?? 0;
					return bOnline - aOnline;
				});

				// Берем топ-3
				const top3Servers = sortedServers.slice(0, 3);

				// Для топ-3 получаем полную информацию с баннерами через /api/v1/game-servers/{server_id}
				const serversWithBanners = await Promise.allSettled(
					top3Servers.map(async (server) => {
						if (!server.id) return server;

						try {
							const fullServerInfo = await gameService.getGameServer(String(server.id));
							// Объединяем полную информацию с уже полученным mcStatus
							return { ...fullServerInfo, mcStatus: server.mcStatus };
						} catch {
							// Если не удалось получить полную информацию, используем то, что есть
							return server;
						}
					})
				);

				// Извлекаем успешные результаты
				const finalServers = serversWithBanners
					.filter(
						(result): result is PromiseFulfilledResult<ServerWithStatus> =>
							result.status === 'fulfilled'
					)
					.map((result) => result.value);

				setServers(finalServers);
				setIsInitialLoad(false);
			} catch (err) {
				console.error('Failed to load servers:', err);
				setError(err instanceof Error ? err.message : 'Не удалось загрузить серверы');
			} finally {
				setIsLoading(false);
			}
		}

		loadServers();
	}, [isInitialLoad]);

	// Функция для извлечения URL баннера
	const getBannerUrl = (bannerUrl: unknown): string | null => {
		if (!bannerUrl) return null;
		if (typeof bannerUrl === 'string') {
			// Если это относительный путь, добавляем базовый URL API
			if (bannerUrl.startsWith('/')) {
				const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
				return `${baseUrl}${bannerUrl}`;
			}
			// Если это полный URL или data URL, возвращаем как есть
			return bannerUrl;
		}
		if (typeof bannerUrl === 'object' && bannerUrl !== null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const obj = bannerUrl as any;
			if ('bannerUrl' in obj && typeof obj.bannerUrl === 'string') {
				const url = obj.bannerUrl;
				if (url.startsWith('/')) {
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
					return `${baseUrl}${url}`;
				}
				return url;
			}
			// Попробуем найти строку в объекте
			for (const key in obj) {
				if (
					typeof obj[key] === 'string' &&
					(obj[key].startsWith('http') || obj[key].startsWith('/'))
				) {
					const url = obj[key];
					if (url.startsWith('/')) {
						const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
						return `${baseUrl}${url}`;
					}
					return url;
				}
			}
		}
		return null;
	};

	// Функция для получения URL иконки
	const getIconUrl = (serverIcon: unknown): string | null => {
		if (!serverIcon) return null;
		if (typeof serverIcon === 'string') {
			// Если это base64 строка, добавляем префикс
			return `data:image/png;base64,${serverIcon}`;
		}
		return null;
	};

	// Функция для определения визуального состояния статуса
	const getServerStatusDisplay = (serverStatus: string | unknown) => {
		const status = typeof serverStatus === 'string' ? serverStatus : 'active';
		switch (status) {
			case 'active':
				return {
					indicatorColor: 'bg-green-500',
					text: null,
				};
			case 'disabled':
				return {
					indicatorColor: 'bg-red-500',
					text: 'Выключен',
				};
			case 'maintenance':
				return {
					indicatorColor: 'bg-yellow-500',
					text: 'Обслуживание',
				};
			default:
				return {
					indicatorColor: 'bg-gray-500',
					text: null,
				};
		}
	};

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Игровые серверы</h3>
				<div className="text-xs text-white/60">Загрузка...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Игровые серверы</h3>
				<div className="text-xs text-red-400">{error}</div>
			</div>
		);
	}

	if (servers.length === 0) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Игровые серверы</h3>
				<div className="text-xs text-white/60">Нет серверов</div>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Игровые серверы</h3>
			<div className="space-y-2">
				{servers.map((server) => {
					const bannerUrl = getBannerUrl(server.bannerUrl);
					const iconUrl = getIconUrl(server.mcStatus?.serverIcon);
					const serverStatus = server.status as string;
					const statusDisplay = getServerStatusDisplay(serverStatus);
					const isOnline = server.mcStatus?.online ?? false;
					const playersOnline = server.mcStatus?.playersOnline ?? 0;
					const playersMax = server.mcStatus?.playersMax ?? 0;
					const serverName = typeof server.name === 'string' ? server.name : 'Без названия';
					const isActive = serverStatus === 'active';
					const seasonCountdown = calculateSeasonCountdown(server.seasonStart, server.seasonEnd);

					return (
						<Link
							key={server.id}
							href="/servers"
							className={`relative flex items-center justify-between rounded-lg overflow-hidden p-3 min-h-[60px] cursor-pointer transition-opacity hover:opacity-90 ${
								bannerUrl ? '' : 'bg-white/5'
							}`}
							style={
								bannerUrl
									? {
											backgroundImage: `url("${bannerUrl}")`,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											backgroundRepeat: 'no-repeat',
										}
									: {}
							}
						>
							{/* Overlay для читаемости */}
							{bannerUrl && <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />}

							{/* Контент */}
							<div className="relative flex items-center gap-2 flex-1 z-10">
								{/* Иконка */}
								{iconUrl && (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img src={iconUrl} alt="" className="w-8 h-8 rounded shrink-0" />
								)}

								{/* Статус и название */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span
											className={`h-2 w-2 rounded-full shrink-0 ${
												isActive
													? isOnline
														? 'bg-green-500'
														: 'bg-red-500'
													: statusDisplay.indicatorColor
											}`}
										/>
										<span className="text-sm font-medium text-white truncate">{serverName}</span>
									</div>
									{seasonCountdown.text && (
										<div className="flex items-center gap-1 mt-0.5">
											<span className="text-[10px]">📅</span>
											<span
												className={`text-[10px] ${
													seasonCountdown.type === 'during'
														? 'text-green-400'
														: seasonCountdown.type === 'after_end'
															? 'text-red-400'
															: 'text-white/70'
												}`}
											>
												{seasonCountdown.text}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Онлайн или статус */}
							<div className="relative text-xs text-white/90 font-medium z-10">
								{isActive ? (
									<span>
										{playersOnline}/{playersMax}
									</span>
								) : (
									<span className="text-white/60">{statusDisplay.text}</span>
								)}
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
