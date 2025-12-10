'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import type { ExternalLinkResponse } from '@/lib/api/generated';
import { MinecraftPlayerProfileCard } from './minecraft-player-profile-card';
import { MinecraftSessionsList } from './minecraft-sessions-list';
import { MinecraftKillsList } from './minecraft-kills-list';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsLoading } from '@/components/stats/common/stats-loading';

export function MinecraftStats() {
	const { user } = useAuth();
	const [minecraftLink, setMinecraftLink] = useState<ExternalLinkResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [playerUuid, setPlayerUuid] = useState<string | null>(null);

	useEffect(() => {
		async function checkMinecraftLink() {
			if (user?.id) {
				try {
					setLoading(true);
					const response = await authService.checkLinkStatus(user.id);

					console.log(
						'[MinecraftStats] Full link status response:',
						JSON.stringify(response, null, 2)
					);

					if (response.links && Array.isArray(response.links)) {
						console.log('[MinecraftStats] All links:', response.links);

						const mcLink = response.links.find((link: ExternalLinkResponse | unknown) => {
							if (typeof link !== 'object' || link === null) return false;

							const linkObj = link as ExternalLinkResponse;
							const platform = linkObj.platform;

							console.log('[MinecraftStats] Checking link:', {
								platform,
								platformType: typeof platform,
								externalId: linkObj.externalId,
								externalIdType: typeof linkObj.externalId,
								id: linkObj.id,
								platformUsername: linkObj.platformUsername,
							});

							// Более гибкая проверка платформы
							if (platform === null || platform === undefined) return false;
							const platformStr = String(platform).toLowerCase().trim();
							return platformStr === 'mc' || platformStr === 'minecraft';
						});

						if (mcLink) {
							console.log('[MinecraftStats] Found Minecraft link:', mcLink);
							setMinecraftLink(mcLink as ExternalLinkResponse);

							// API возвращает external_id в snake_case, но TypeScript интерфейс использует camelCase
							// Нужно обращаться к сырому объекту
							const rawLink = mcLink as unknown as Record<string, unknown>;
							const uuid = rawLink.external_id || (mcLink as ExternalLinkResponse).externalId;
							console.log('[MinecraftStats] externalId value:', uuid, 'type:', typeof uuid);

							// Более гибкая проверка UUID - может быть строкой или числом
							if (uuid !== null && uuid !== undefined) {
								const uuidString = String(uuid).trim();
								console.log('[MinecraftStats] UUID string:', uuidString);
								if (uuidString.length > 0) {
									setPlayerUuid(uuidString);
									console.log('[MinecraftStats] Set playerUuid to:', uuidString);
								} else {
									console.warn('[MinecraftStats] UUID string is empty');
								}
							} else {
								console.warn('[MinecraftStats] externalId is null or undefined');
							}
						} else {
							console.warn('[MinecraftStats] Minecraft link not found in links array');
						}
					} else {
						console.warn('[MinecraftStats] No links array in response');
					}
				} catch (error) {
					console.error('Failed to check Minecraft link:', error);
				} finally {
					setLoading(false);
				}
			}
		}

		if (user?.id) {
			checkMinecraftLink();
		} else {
			setLoading(false);
		}
	}, [user?.id]);

	if (loading) {
		return <StatsLoading message="Проверка привязки аккаунта..." />;
	}

	if (!minecraftLink || !playerUuid) {
		return (
			<StatsEmpty
				message="Minecraft аккаунт не привязан"
				description="Привяжите свой Minecraft аккаунт в профиле, чтобы просматривать статистику"
			/>
		);
	}

	return (
		<div>
			<MinecraftPlayerProfileCard playerUuid={playerUuid} />
			<MinecraftSessionsList playerUuid={playerUuid} />
			<MinecraftKillsList playerUuid={playerUuid} />
		</div>
	);
}
