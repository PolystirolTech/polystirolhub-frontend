'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { gameService } from '@/lib/game/game-service';
import type { GameServerPublic, ServerStatusResponse, GameTypeResponse } from '@/lib/api/generated';

interface ServerWithStatus extends GameServerPublic {
	mcStatus?: ServerStatusResponse;
}

export default function ServersPage() {
	const [servers, setServers] = useState<ServerWithStatus[]>([]);
	const [gameTypes, setGameTypes] = useState<GameTypeResponse[]>([]);
	const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copiedIp, setCopiedIp] = useState<string | null>(null);

	// Вспомогательные функции для обработки данных
	const getBannerUrl = (bannerUrl: unknown): string | null => {
		if (!bannerUrl) return null;
		if (typeof bannerUrl === 'string') {
			if (bannerUrl.startsWith('/')) {
				const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
				return `${baseUrl}${bannerUrl}`;
			}
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

	const getIconUrl = (serverIcon: unknown): string | null => {
		if (!serverIcon) return null;
		if (typeof serverIcon === 'string') {
			return `data:image/png;base64,${serverIcon}`;
		}
		return null;
	};

	const getGameTypeName = (gameType: GameTypeResponse): string => {
		if (!gameType) return 'Неизвестный тип';
		if (typeof gameType.name === 'string') {
			return gameType.name;
		}
		if (typeof gameType.name === 'object' && gameType.name !== null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for (const key in gameType.name as any) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const val = (gameType.name as any)[key];
				if (typeof val === 'string' && val.trim()) {
					return val;
				}
			}
		}
		return 'Неизвестный тип';
	};

	const getGameTypeId = (gameType: GameTypeResponse): string | null => {
		if (!gameType) return null;
		if (typeof gameType.id === 'string') {
			return gameType.id;
		}
		if (typeof gameType.id === 'object' && gameType.id !== null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for (const key in gameType.id as any) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const val = (gameType.id as any)[key];
				if (typeof val === 'string' && val.trim()) {
					return val;
				}
			}
		}
		return null;
	};

	const getDescription = (desc: unknown): string => {
		if (typeof desc === 'string') return desc;
		if (typeof desc === 'object' && desc && 'description' in desc) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (desc as any).description || '';
		}
		return '';
	};

	interface ModInfo {
		name: string;
		url: string;
	}

	const getModsArray = (mods: unknown): ModInfo[] => {
		if (!mods) return [];
		if (Array.isArray(mods)) {
			return mods
				.filter((mod): mod is string => typeof mod === 'string' && mod.trim().length > 0)
				.map((mod) => {
					const parts = mod.split(': ').map((s) => s.trim());
					if (parts.length >= 2) {
						return {
							name: parts[0],
							url: parts.slice(1).join(': '), // На случай если URL содержит ": "
						};
					}
					// Fallback для старого формата (только URL)
					return {
						name: mod,
						url: mod,
					};
				});
		}
		if (typeof mods === 'string') {
			try {
				const parsed = JSON.parse(mods);
				if (Array.isArray(parsed)) {
					return parsed
						.filter((mod): mod is string => typeof mod === 'string' && mod.trim().length > 0)
						.map((mod) => {
							const parts = mod.split(': ').map((s) => s.trim());
							if (parts.length >= 2) {
								return {
									name: parts[0],
									url: parts.slice(1).join(': '),
								};
							}
							return {
								name: mod,
								url: mod,
							};
						});
				}
			} catch {
				// Если не JSON, пробуем как строку с разделителями
				if (mods.includes(',') || mods.includes(';')) {
					return mods
						.split(/[,;]/)
						.map((m) => m.trim())
						.filter((m) => m.length > 0)
						.map((mod) => {
							const parts = mod.split(': ').map((s) => s.trim());
							if (parts.length >= 2) {
								return {
									name: parts[0],
									url: parts.slice(1).join(': '),
								};
							}
							return {
								name: mod,
								url: mod,
							};
						});
				}
				// Если это просто строка
				if (mods.trim().length > 0) {
					const parts = mods
						.trim()
						.split(': ')
						.map((s) => s.trim());
					if (parts.length >= 2) {
						return [
							{
								name: parts[0],
								url: parts.slice(1).join(': '),
							},
						];
					}
					return [
						{
							name: mods.trim(),
							url: mods.trim(),
						},
					];
				}
			}
		}
		return [];
	};

	const cleanMotd = (motd: string): string => {
		// Убираем цветовые коды Minecraft (§ + символ)
		return motd.replace(/§[0-9a-fk-or]/gi, '');
	};

	const formatIpPort = (ip: unknown, port: unknown): string => {
		const ipStr = typeof ip === 'string' ? ip : '';
		const portStr = typeof port === 'string' ? port : '';
		if (portStr) {
			return `${ipStr}:${portStr}`;
		}
		return ipStr;
	};

	const getServerName = (name: unknown): string => {
		if (typeof name === 'string') return name;
		return 'Без названия';
	};

	// Функция для определения визуального состояния статуса
	const getServerStatusDisplay = (serverStatus: string | unknown) => {
		const status = typeof serverStatus === 'string' ? serverStatus : 'active';
		switch (status) {
			case 'active':
				return {
					indicatorColor: 'bg-green-500',
					text: null,
					message: null,
				};
			case 'disabled':
				return {
					indicatorColor: 'bg-red-500',
					text: 'Выключен',
					message: 'Сервер выключен',
				};
			case 'maintenance':
				return {
					indicatorColor: 'bg-yellow-500',
					text: 'Обслуживание',
					message: 'Сервер на обслуживании',
				};
			default:
				return {
					indicatorColor: 'bg-gray-500',
					text: null,
					message: null,
				};
		}
	};

	const getIpString = (ip: unknown): string => {
		if (typeof ip === 'string') return ip;
		return '';
	};

	const getPortString = (port: unknown): string => {
		if (typeof port === 'string') return port;
		return '';
	};

	// Загрузка данных
	useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true);
				setError(null);

				// Загружаем типы игр
				const types = await gameService.getGameTypes();
				setGameTypes(types);

				// Загружаем серверы
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

				// Для серверов получаем полную информацию с баннерами
				const serversWithBanners = await Promise.allSettled(
					successfulServers.map(async (server) => {
						if (!server.id) return server;

						try {
							const fullServerInfo = await gameService.getGameServer(String(server.id));
							return { ...fullServerInfo, mcStatus: server.mcStatus };
						} catch {
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
			} catch (err) {
				console.error('Failed to load servers:', err);
				setError(err instanceof Error ? err.message : 'Не удалось загрузить серверы');
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, []);

	// Фильтрация серверов
	const filteredServers = selectedTypeId
		? servers.filter((server) => {
				const typeId = getGameTypeId(server.gameType);
				return typeId === selectedTypeId;
			})
		: servers;

	// Копирование IP
	const handleCopyIp = async (ip: string, port: string) => {
		const ipPort = formatIpPort(ip, port);
		try {
			await navigator.clipboard.writeText(ipPort);
			setCopiedIp(ipPort);
			setTimeout(() => setCopiedIp(null), 2000);
		} catch (err) {
			console.error('Failed to copy IP:', err);
		}
	};

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Сервера
					</h1>
					<p className="text-lg text-white/60">Список игровых серверов</p>
				</div>

				{/* Фильтр по типу */}
				<div className="mb-6">
					<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4">
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-sm font-medium text-white/80">Тип сервера:</span>
							<button
								onClick={() => setSelectedTypeId(null)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									selectedTypeId === null
										? 'bg-primary text-white'
										: 'bg-white/10 text-white/70 hover:bg-white/20'
								}`}
							>
								Все типы
							</button>
							{gameTypes.map((type) => {
								const typeId = getGameTypeId(type);
								if (!typeId) return null;
								return (
									<button
										key={typeId}
										onClick={() => setSelectedTypeId(typeId)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											selectedTypeId === typeId
												? 'bg-primary text-white'
												: 'bg-white/10 text-white/70 hover:bg-white/20'
										}`}
									>
										{getGameTypeName(type)}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Сообщение об ошибке */}
				{error && (
					<div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
						{error}
					</div>
				)}

				{/* Загрузка */}
				{isLoading && (
					<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
						<p className="text-white/60">Загрузка серверов...</p>
					</div>
				)}

				{/* Список серверов */}
				{!isLoading && !error && (
					<>
						{filteredServers.length === 0 ? (
							<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
								<p className="text-white/60">Нет серверов</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredServers.map((server) => {
									const bannerUrl = getBannerUrl(server.bannerUrl);
									const iconUrl = getIconUrl(server.mcStatus?.serverIcon);
									const serverStatus = server.status as string;
									const statusDisplay = getServerStatusDisplay(serverStatus);
									const isActive = serverStatus === 'active';
									const isOnline = server.mcStatus?.online ?? false;
									const playersOnline = server.mcStatus?.playersOnline ?? 0;
									const playersMax = server.mcStatus?.playersMax ?? 0;
									const serverName = getServerName(server.name);
									const ip = getIpString(server.ip);
									const port = getPortString(server.port);
									const description = getDescription(server.description);
									const mods = getModsArray(server.mods);
									const version =
										typeof server.mcStatus?.version === 'string' ? server.mcStatus.version : '';
									const ping =
										typeof server.mcStatus?.ping === 'number'
											? Math.trunc(server.mcStatus.ping)
											: null;
									const motdRaw =
										typeof server.mcStatus?.motd === 'string' ? server.mcStatus.motd : '';
									const motd = motdRaw ? cleanMotd(motdRaw) : '';

									return (
										<div
											key={String(server.id)}
											className={`glass-card bg-[var(--color-secondary)]/65 overflow-hidden relative ${
												bannerUrl ? 'min-h-[400px]' : ''
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
											{bannerUrl && (
												<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
											)}

											{/* Контент карточки */}
											<div className="relative z-10 p-6 flex flex-col h-full">
												{/* Заголовок с иконкой и статусом */}
												<div className="flex items-start gap-3 mb-4">
													{iconUrl && (
														/* eslint-disable-next-line @next/next/no-img-element */
														<img src={iconUrl} alt="" className="w-12 h-12 rounded shrink-0" />
													)}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<span
																className={`h-2 w-2 rounded-full shrink-0 ${
																	isActive
																		? isOnline
																			? 'bg-green-500'
																			: 'bg-red-500'
																		: statusDisplay.indicatorColor
																}`}
															/>
															<h3 className="text-lg font-bold text-white truncate">
																{serverName}
															</h3>
															{statusDisplay.text && (
																<span className="text-xs text-white/60">
																	({statusDisplay.text})
																</span>
															)}
														</div>
														<p className="text-sm text-white/70">
															{getGameTypeName(server.gameType)}
														</p>
														{statusDisplay.message && (
															<p className="text-xs text-yellow-400 mt-1">
																{statusDisplay.message}
															</p>
														)}
													</div>
												</div>

												{/* IP и порт */}
												<div className="mb-4">
													{ip && (
														<button
															onClick={() => handleCopyIp(ip, port)}
															className="flex items-center gap-2 text-sm font-mono text-white/90 hover:text-white transition-colors group"
														>
															<span className="text-white/60">IP:</span>
															<span className="underline decoration-dotted">
																{formatIpPort(ip, port)}
															</span>
															{copiedIp === formatIpPort(ip, port) && (
																<span className="text-xs text-green-400">✓ Скопировано</span>
															)}
														</button>
													)}
												</div>

												{/* Описание */}
												{description && (
													<p className="text-sm text-white/70 mb-4 line-clamp-3">{description}</p>
												)}

												{/* Статистика */}
												<div className="mt-auto space-y-2">
													{/* Онлайн или статус */}
													{isActive ? (
														<div className="flex items-center justify-between text-sm">
															<span className="text-white/60">Онлайн:</span>
															<span className="text-white font-medium">
																{playersOnline}/{playersMax}
															</span>
														</div>
													) : (
														<div className="flex items-center justify-between text-sm">
															<span className="text-white/60">Статус:</span>
															<span className="text-white font-medium">{statusDisplay.text}</span>
														</div>
													)}

													{/* Ping */}
													{isActive && ping !== null && (
														<div className="flex items-center justify-between text-sm">
															<span className="text-white/60">Ping:</span>
															<span className="text-white font-medium">{ping}ms</span>
														</div>
													)}

													{/* Версия */}
													{isActive && version && (
														<div className="flex items-center justify-between text-sm">
															<span className="text-white/60">Версия:</span>
															<span className="text-white font-medium">{version}</span>
														</div>
													)}

													{/* Моды */}
													{mods.length > 0 && (
														<div className="pt-2 border-t border-white/10">
															<span className="text-xs text-white/60 block mb-1">
																Моды ({mods.length}):
															</span>
															<div className="flex flex-wrap gap-1">
																{mods.slice(0, 5).map((mod, idx) => (
																	<a
																		key={idx}
																		href={mod.url}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-xs px-2 py-1 bg-white/10 rounded text-white/80 hover:bg-white/20 hover:text-primary transition-colors truncate max-w-[150px] inline-block"
																		title={`${mod.name}: ${mod.url}`}
																	>
																		{mod.name}
																	</a>
																))}
																{mods.length > 5 && (
																	<span className="text-xs px-2 py-1 text-white/60">
																		+{mods.length - 5}
																	</span>
																)}
															</div>
														</div>
													)}

													{/* MOTD */}
													{isActive && motd && (
														<div className="pt-2 border-t border-white/10">
															<p className="text-xs text-white/80 line-clamp-2">{motd}</p>
														</div>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
