'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth';
import { gameService } from '@/lib/game/game-service';
import type { GameServerPublic } from '@/lib/api/generated';
import { MinecraftStats } from '@/components/stats/minecraft/minecraft-stats';
import { MinecraftServerStatsCard } from '@/components/stats/minecraft/minecraft-server-stats-card';
import { MinecraftServerTopPlayers } from '@/components/stats/minecraft/minecraft-server-top-players';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';

type GameType = 'minecraft';

export default function StatsPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
	const [servers, setServers] = useState<GameServerPublic[]>([]);
	const [loadingServers, setLoadingServers] = useState(true);
	const [serversError, setServersError] = useState<string | null>(null);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	// Load servers
	useEffect(() => {
		async function loadServers() {
			try {
				setLoadingServers(true);
				setServersError(null);
				const data = await gameService.getGameServers();

				// Функция для извлечения имени типа игры
				const getGameTypeName = (gameType: unknown): string | null => {
					if (!gameType) return null;

					// Если это строка напрямую
					if (typeof gameType === 'string') {
						return gameType.trim() || null;
					}

					// Если это объект
					if (typeof gameType === 'object') {
						const gameTypeObj = gameType as Record<string, unknown>;

						// Проверяем поле name напрямую
						if (gameTypeObj.name) {
							if (typeof gameTypeObj.name === 'string') {
								return gameTypeObj.name.trim() || null;
							}
							// Если это объект с полем value
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

				// Фильтруем только Minecraft серверы
				const minecraftServers = data.filter((server) => {
					// Используем game_type (snake_case) вместо gameType
					const serverObj = server as unknown as Record<string, unknown>;
					const gameType = serverObj.game_type;
					const gameTypeName = getGameTypeName(gameType);

					if (!gameTypeName) {
						return false;
					}

					const nameLower = gameTypeName.toLowerCase().trim();
					const isMinecraft =
						nameLower === 'minecraft' ||
						nameLower === 'mincecraft' || // опечатка в данных
						nameLower === 'mc' ||
						nameLower.includes('minecraft') ||
						nameLower.includes('mincecraft') || // опечатка в данных
						nameLower.includes('mc');

					return isMinecraft;
				});

				console.log('[StatsPage] Filtered Minecraft servers:', minecraftServers);
				setServers(minecraftServers);
			} catch (err) {
				setServersError(err instanceof Error ? err.message : 'Не удалось загрузить серверы');
			} finally {
				setLoadingServers(false);
			}
		}

		if (isAuthenticated) {
			loadServers();
		}
	}, [isAuthenticated]);

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

	if (!isAuthenticated || !user) {
		return null; // Will redirect to login
	}

	const availableGames: GameType[] = ['minecraft'];
	// В будущем можно добавить: ['minecraft', 'cs2', 'dota2']

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
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

				{/* Game Tabs */}
				{availableGames.length > 1 && (
					<div className="mb-6 flex gap-2 border-b border-white/10">
						{availableGames.map((game) => (
							<button
								key={game}
								onClick={() => setSelectedGame(game)}
								className={`px-6 py-3 font-medium transition-colors border-b-2 ${
									selectedGame === game
										? 'border-primary text-primary'
										: 'border-transparent text-white/60 hover:text-white'
								}`}
							>
								{game === 'minecraft' ? 'Minecraft' : String(game).toUpperCase()}
							</button>
						))}
					</div>
				)}

				{/* Player Stats Section */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-white mb-4">Моя статистика</h2>
					{selectedGame === 'minecraft' && <MinecraftStats />}
					{/* В будущем: selectedGame === 'cs2' && <CS2Stats /> */}
				</div>

				{/* Server Stats Section */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-white mb-4">Статистика серверов</h2>
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
						<div>
							{servers.map((server) => {
								if (!server.id) return null;
								return (
									<div key={server.id}>
										<MinecraftServerStatsCard serverId={server.id} />
										<MinecraftServerTopPlayers serverId={server.id} limit={10} />
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
