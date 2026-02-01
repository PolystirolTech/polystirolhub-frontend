'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import type { ExternalLinkResponse } from '@/lib/api/generated';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { GoldSourcePlayerProfileCard } from './goldsource-player-profile-card';

export function GoldSourceStats() {
	const { user } = useAuth();
	const [steamLink, setSteamLink] = useState<ExternalLinkResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [steamId, setSteamId] = useState<string | null>(null);

	useEffect(() => {
		async function checkSteamLink() {
			if (user?.id) {
				try {
					setLoading(true);
					const response = await authService.checkLinkStatus(user.id);

					if (response.links && Array.isArray(response.links)) {
						const steamLinkObj = response.links.find((link: ExternalLinkResponse | unknown) => {
							if (typeof link !== 'object' || link === null) return false;

							const linkObj = link as ExternalLinkResponse;
							const platform = linkObj.platform;

							if (platform === null || platform === undefined) return false;
							const platformStr = String(platform).toLowerCase().trim();
							return platformStr === 'steam';
						});

						if (steamLinkObj) {
							setSteamLink(steamLinkObj as ExternalLinkResponse);

							const rawLink = steamLinkObj as unknown as Record<string, unknown>;
							const id = rawLink.external_id || (steamLinkObj as ExternalLinkResponse).externalId;

							if (id !== null && id !== undefined) {
								const idString = String(id).trim();
								if (idString.length > 0) {
									setSteamId(idString);
								}
							}
						}
					}
				} catch (error) {
					console.error('Failed to check Steam link:', error);
				} finally {
					setLoading(false);
				}
			}
		}

		if (user?.id) {
			checkSteamLink();
		} else {
			setLoading(false);
		}
	}, [user?.id]);

	if (loading) {
		return <StatsLoading message="Проверка привязки аккаунта..." />;
	}

	if (!steamLink || !steamId) {
		return (
			<StatsEmpty
				message="Steam аккаунт не привязан"
				description="Привяжите свой Steam аккаунт в профиле, чтобы просматривать статистику GoldSource игр"
			/>
		);
	}
	return (
		<div>
			<GoldSourcePlayerProfileCard steamId={steamId} />
		</div>
	);
}
