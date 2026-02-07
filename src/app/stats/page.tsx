'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth';
import { gameService } from '@/lib/game/game-service';
import type { GameServerPublic } from '@/lib/api/generated';
import { MinecraftStats } from '@/components/stats/minecraft/minecraft-stats';
import { MinecraftServerStatsCard } from '@/components/stats/minecraft/minecraft-server-stats-card';
import { MinecraftServerTopPlayers } from '@/components/stats/minecraft/minecraft-server-top-players';
import { GoldSourceStats } from '@/components/stats/goldsource/goldsource-stats';
import { GoldSourceServerStatsCard } from '@/components/stats/goldsource/goldsource-server-stats-card';
import { GoldSourceServerTopPlayers } from '@/components/stats/goldsource/goldsource-server-top-players';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { isMinecraftGame, isGoldSourceGame } from '@/lib/utils/game-type-utils';

interface ServerWithType extends GameServerPublic {
	serverType: 'minecraft' | 'goldsource';
	gameTypeName: string;
	serverName: string;
}

export default function StatsPage() {
	const { isAuthenticated, isLoading } = useAuth();
	const [servers, setServers] = useState<ServerWithType[]>([]);
	const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
	const [loadingServers, setLoadingServers] = useState(true);
	const [serversError, setServersError] = useState<string | null>(null);

	// Redirect to login if not authenticated - REMOVED
	// useEffect(() => {
	// 	if (!isLoading && !isAuthenticated) {
	// 		router.push('/login');
	// 	}
	// }, [isAuthenticated, isLoading, router]);

	// Helper functions
	const getGameTypeName = (gameType: unknown): string | null => {
		if (!gameType) return null;

		if (typeof gameType === 'string') {
			return gameType.trim() || null;
		}

		if (typeof gameType === 'object') {
			const gameTypeObj = gameType as Record<string, unknown>;

			if (gameTypeObj.name) {
				if (typeof gameTypeObj.name === 'string') {
					return gameTypeObj.name.trim() || null;
				}
				if (
					typeof gameTypeObj.name === 'object' &&
					gameTypeObj.name !== null &&
					'value' in gameTypeObj.name
				) {
					const value = (gameTypeObj.name as { value: unknown }).value;
					if (typeof value === 'string') {
						return value.trim() || null;
					}
				}
			}
		}

		return null;
	};

	const getServerName = (name: unknown): string => {
		if (typeof name === 'string' && name.trim()) return name;
		return 'Без названия';
	};

	const getServerId = (id: unknown): string | null => {
		if (typeof id === 'string') return id;
		if (typeof id === 'number') return String(id);
		return null;
	};

	// Load servers
	useEffect(() => {
		async function loadServers() {
			try {
				setLoadingServers(true);
				setServersError(null);
				const data = await gameService.getGameServers();

				const allServers: ServerWithType[] = [];

				for (const server of data) {
					const serverObj = server as unknown as Record<string, unknown>;
					const gameType = serverObj.game_type;
					const gameTypeName = getGameTypeName(gameType);
					const serverName = getServerName(server.name);
					const serverId = getServerId(server.id);

					if (!gameTypeName || !serverId) continue;

					if (isMinecraftGame(gameTypeName)) {
						allServers.push({
							...server,
							serverType: 'minecraft',
							gameTypeName: 'Minecraft',
							serverName,
						});
					} else if (isGoldSourceGame(gameTypeName)) {
						allServers.push({
							...server,
							serverType: 'goldsource',
							gameTypeName,
							serverName,
						});
					}
				}

				console.log('[StatsPage] All servers:', allServers);
				setServers(allServers);

				// Select first server by default
				if (allServers.length > 0 && allServers[0].id) {
					setSelectedServerId(String(allServers[0].id));
				}
			} catch (err) {
				setServersError(err instanceof Error ? err.message : 'Не удалось загрузить серверы');
			} finally {
				setLoadingServers(false);
			}
		}

		loadServers();
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
						<StatsLoading message="Загрузка..." />
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	// if (!isAuthenticated || !user) {
	// 	return null; // Will redirect to login
	// }

	const selectedServer = servers.find((s) => String(s.id) === selectedServerId);

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-3xl sm:text-4xl font-bold tracking-tighter text-white md:text-6xl">
						Статистика
					</h1>
					<p className="text-lg text-white/60">Ваша статистика и достижения</p>
				</div>

				{/* Update Notification */}
				<div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm">
					<div className="flex items-center gap-2">
						<svg
							className="h-5 w-5 shrink-0 text-blue-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p className="text-sm text-blue-300">
							Данные статистики обновляются автоматически раз в 5 минут
						</p>
					</div>
				</div>

				{/* Server Tabs */}
				{loadingServers ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
						<StatsLoading message="Загрузка серверов..." />
					</div>
				) : serversError ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
						<StatsError message={serversError} onRetry={() => window.location.reload()} />
					</div>
				) : servers.length === 0 ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
						<StatsEmpty message="Нет доступных серверов" />
					</div>
				) : (
					<>
						{/* Tabs for server selection */}
						<div className="mb-6">
							<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4">
								<div className="flex flex-wrap items-center gap-3">
									<span className="text-sm font-medium text-white/80">Сервер:</span>
									{servers.map((server) => {
										const serverId = String(server.id);
										return (
											<button
												key={serverId}
												onClick={() => setSelectedServerId(serverId)}
												className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
													selectedServerId === serverId
														? 'bg-primary text-white'
														: 'bg-white/10 text-white/70 hover:bg-white/20'
												}`}
											>
												{server.gameTypeName} - {server.serverName}
											</button>
										);
									})}
								</div>
							</div>
						</div>

						{/* Selected Server Content */}
						{selectedServer && selectedServer.id && (
							<div>
								{/* Player Stats Section */}
								{isAuthenticated && (
									<div className="mb-6">
										<h2 className="text-2xl font-bold text-white mb-4">Моя статистика</h2>
										{selectedServer.serverType === 'minecraft' ? (
											<MinecraftStats serverId={selectedServer.id} />
										) : (
											<GoldSourceStats serverId={selectedServer.id} />
										)}
									</div>
								)}

								{/* Server Stats Card */}
								<div className="mb-4">
									{selectedServer.serverType === 'minecraft' ? (
										<MinecraftServerStatsCard serverId={selectedServer.id} />
									) : (
										<GoldSourceServerStatsCard serverId={selectedServer.id} />
									)}
								</div>

								{/* Top Players */}
								<div>
									{selectedServer.serverType === 'minecraft' ? (
										<MinecraftServerTopPlayers serverId={selectedServer.id} limit={10} />
									) : (
										<GoldSourceServerTopPlayers serverId={selectedServer.id} limit={10} />
									)}
								</div>
							</div>
						)}
					</>
				)}
			</main>
			<Footer />
		</div>
	);
}
