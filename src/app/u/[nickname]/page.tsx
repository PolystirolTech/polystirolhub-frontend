'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { profileService, type UserProfileResponse } from '@/lib/api/profile-service';
import { gameService } from '@/lib/game/game-service';
import type { GameServerPublic } from '@/lib/api/generated';
import { isMinecraftGame, isGoldSourceGame } from '@/lib/utils/game-type-utils';
import { BadgeImage } from '@/components/badges/badge-image';
import { MinecraftPlayerProfileCard } from '@/components/stats/minecraft/minecraft-player-profile-card';
import { GoldSourcePlayerProfileCard } from '@/components/stats/goldsource/goldsource-player-profile-card';
// import { MinecraftPlayerProfileFromJSON } from '@/lib/api/generated/models/MinecraftPlayerProfile';
// Import GoldSourcePlayerProfileFromJSON if available, otherwise we might need to cast or mock
// Assuming it exists similar to Minecraft
// import { GoldSourcePlayerProfileFromJSON } from '@/lib/api/generated/models/GoldSourcePlayerProfile';
import { useBackground } from '@/lib/background/background-context';
import { UserMediaList } from '@/components/lists/user-media-list';

type ProfileTab = 'stats' | 'media';

interface ServerWithType extends GameServerPublic {
	serverType: 'minecraft' | 'goldsource';
	gameTypeName: string;
	serverName: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
	const { nickname } = use(params);
	const [profile, setProfile] = useState<UserProfileResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [servers, setServers] = useState<ServerWithType[]>([]);
	const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
	const [loadingServers, setLoadingServers] = useState(true);
	const [profileTab, setProfileTab] = useState<ProfileTab>('stats');

	const { setOverrideBackground } = useBackground();

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);
				const decodedNickname = decodeURIComponent(nickname);
				const data = await profileService.getProfile(decodedNickname);
				setProfile(data);

				// Check for background in root or header (backend consistency)
				const bg = data.background || data.header.background || null;
				setOverrideBackground(bg);
			} catch (err) {
				console.error('Error loading profile:', err);
				if (err instanceof Error && err.message === 'Пользователь не найден') {
					notFound();
				}
				setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль');
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, [nickname, setOverrideBackground]);

	useEffect(() => {
		// Cleanup override when component unmounts
		return () => {
			setOverrideBackground(undefined);
		};
	}, [setOverrideBackground]);

	useEffect(() => {
		async function loadServers() {
			try {
				setLoadingServers(true);
				const data = await gameService.getGameServers();
				const allServers: ServerWithType[] = [];

				for (const server of data) {
					const serverObj = server as unknown as Record<string, unknown>;
					const gameType = serverObj.game_type;

					let gameTypeName: string | null = null;
					if (typeof gameType === 'string') {
						gameTypeName = gameType;
					} else if (typeof gameType === 'object' && gameType !== null) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const gt = gameType as any;
						gameTypeName = gt.name?.value || gt.name || null;
					}

					if (!gameTypeName) continue;

					const serverName = typeof server.name === 'string' ? server.name : 'Без названия';

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
							gameTypeName: gameTypeName,
							serverName,
						});
					}
				}

				setServers(allServers);
				if (allServers.length > 0) {
					setSelectedServerId(String(allServers[0].id));
				}
			} catch (err) {
				console.error('Error loading servers:', err);
			} finally {
				setLoadingServers(false);
			}
		}

		loadServers();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-white/60">Загрузка профиля...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-10 text-center">
						<h1 className="text-2xl font-bold text-white mb-4">Ошибка</h1>
						<p className="text-white/60">{error || 'Профиль не найден'}</p>
						<Link
							href="/"
							className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
						>
							На главную
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const { header, badges, minecraft_stats, goldsource_stats } = profile;
	const selectedServer = servers.find((s) => String(s.id) === selectedServerId);

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header Section */}
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 mb-6">
					<div className="flex flex-col md:flex-row items-center md:items-start gap-8">
						{/* Avatar */}
						<div className="h-32 w-32 overflow-hidden rounded-2xl shrink-0 shadow-lg shadow-black/20 ring-4 ring-white/10">
							{header.avatar ? (
								<Image
									src={header.avatar}
									alt={header.username}
									className="h-full w-full object-cover"
									width={128}
									height={128}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-primary to-secondary">
									{header.username.substring(0, 2).toUpperCase()}
								</div>
							)}
						</div>

						{/* User Info */}
						<div className="flex-1 w-full">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
								<div>
									<h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
										{header.username}
									</h1>
									<div className="flex items-center gap-3">
										<span className="inline-flex items-center rounded-md bg-primary/20 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/30">
											Уровень {header.level}
										</span>
									</div>
								</div>
							</div>

							{/* Progress Bar */}
							<div className="mb-6">
								<div className="flex justify-between text-xs text-white/60 mb-1">
									<span>XP: {header.xp}</span>
									<span>{header.xp_for_next_level} XP до след. уровня</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
									<div
										className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
										style={{ width: `${Math.min(100, Math.max(0, header.progress_percent))}%` }}
									/>
								</div>
							</div>

							{/* Linked Accounts */}
							{header.linked_accounts.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{header.linked_accounts.map((account, idx) => (
										<div
											key={`${account.platform}-${idx}`}
											className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/80 border border-white/5"
										>
											<span className="uppercase text-[10px] font-bold text-white/40">
												{account.platform}
											</span>
											<span className="font-medium">{account.nickname}</span>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Badges Section */}
				{badges && badges.length > 0 && (
					<div className="mb-6">
						<h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
							<span role="img" aria-label="trophy">
								🏆
							</span>
							Последние достижения
						</h2>
						<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6">
							<div className="flex flex-wrap gap-4">
								{badges.map((badge) => (
									<div
										key={badge.id}
										className="group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-colors hover:bg-white/5"
										title={badge.description}
									>
										<BadgeImage src={badge.image_url} alt={badge.name} size="md" />
										<span className="text-xs text-white/70 max-w-[100px] truncate text-center group-hover:text-white transition-colors">
											{badge.name}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Tab switcher */}
				<div className="flex gap-1 p-1 rounded-lg bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 mb-6">
					{(
						[
							{ key: 'stats', label: 'Статистика', icon: '📊' },
							{ key: 'media', label: 'Медиа списки', icon: '📋' },
						] as const
					).map(({ key, label, icon }) => (
						<button
							key={key}
							onClick={() => setProfileTab(key)}
							className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
								profileTab === key ? 'bg-primary/20 text-primary' : 'text-white/50 hover:text-white'
							}`}
						>
							<span>{icon}</span>
							{label}
						</button>
					))}
				</div>

				{/* Stats Tab */}
				{profileTab === 'stats' && (
					<div>
						{loadingServers ? (
							<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 flex justify-center">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						) : servers.length === 0 ? (
							<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 text-center text-white/60">
								Нет доступных серверов
							</div>
						) : (
							<>
								{/* Server Tabs */}
								<div className="mb-6">
									<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4">
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

								{/* Selected Server Stats */}
								{selectedServer && (
									<div>
										{selectedServer.serverType === 'minecraft'
											? (() => {
													const stats = minecraft_stats.find(
														(s) =>
															s.servers_played?.includes(selectedServer.serverName) ||
															s.servers_played?.includes(String(selectedServer.id))
													);

													if (!stats) {
														return (
															<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 text-center text-white/60">
																Пользователь не играл на этом сервере
															</div>
														);
													}

													return (
														<MinecraftPlayerProfileCard
															playerUuid={String(stats.uuid)}
															serverId={selectedServer.id}
														/>
													);
												})()
											: (() => {
													const stats = goldsource_stats.find(
														(s) =>
															s.servers_played?.includes(selectedServer.serverName) ||
															s.servers_played?.includes(String(selectedServer.id))
													);

													if (!stats) {
														return (
															<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 text-center text-white/60">
																Пользователь не играл на этом сервере
															</div>
														);
													}

													return (
														<GoldSourcePlayerProfileCard
															steamId={stats.steam_id}
															serverId={selectedServer.id}
														/>
													);
												})()}
									</div>
								)}
							</>
						)}
					</div>
				)}

				{/* Media Tab */}
				{profileTab === 'media' && <UserMediaList username={header.username} />}
			</main>
			<Footer />
		</div>
	);
}
