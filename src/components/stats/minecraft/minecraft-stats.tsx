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

					if (response.links && Array.isArray(response.links)) {
						const mcLink = response.links.find((link: ExternalLinkResponse | unknown) => {
							if (typeof link !== 'object' || link === null) return false;

							const linkObj = link as ExternalLinkResponse;
							const platform = linkObj.platform;

							// Более гибкая проверка платформы
							if (platform === null || platform === undefined) return false;
							const platformStr = String(platform).toLowerCase().trim();
							return platformStr === 'mc' || platformStr === 'minecraft';
						});

						if (mcLink) {
							setMinecraftLink(mcLink as ExternalLinkResponse);
							// externalId содержит UUID игрока для Minecraft
							const uuid = (mcLink as ExternalLinkResponse).externalId;

							// Более гибкая проверка UUID - может быть строкой или числом
							if (uuid !== null && uuid !== undefined) {
								const uuidString = String(uuid).trim();
								if (uuidString.length > 0) {
									setPlayerUuid(uuidString);
								}
							}
						}
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
