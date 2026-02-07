'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import { whitelistService } from '@/lib/whitelist/whitelist-service';
import type { ExternalLinkResponse } from '@/lib/api/generated';
import { WhitelistApplyModal } from './whitelist-apply-modal';

interface WhitelistApplyButtonProps {
	serverId: string;
	serverName: string;
	isWhitelist: boolean;
}

/**
 * Extracts Minecraft nickname from ExternalLinkResponse platformUsername.
 */
function getMinecraftNickname(mcLink: ExternalLinkResponse | null): string | null {
	if (!mcLink) return null;

	const rawLink = mcLink as unknown as Record<string, unknown>;
	const platformUsername =
		rawLink.platform_username ?? (mcLink as ExternalLinkResponse).platformUsername;

	if (!platformUsername) return null;

	if (typeof platformUsername === 'string') {
		const trimmed = platformUsername.trim();
		return trimmed ? trimmed : null;
	}
	if (typeof platformUsername === 'object' && platformUsername !== null) {
		const obj = platformUsername as Record<string, unknown>;
		const val =
			(typeof obj.username === 'string' ? obj.username.trim() : null) ||
			(typeof obj.name === 'string' ? obj.name.trim() : null) ||
			(typeof obj.value === 'string' ? obj.value.trim() : null);
		return val || null;
	}
	return String(platformUsername).trim() || null;
}

export function WhitelistApplyButton({
	serverId,
	serverName,
	isWhitelist,
}: WhitelistApplyButtonProps) {
	const { user, isAuthenticated, isLoading: authLoading } = useAuth();
	const [mcLink, setMcLink] = useState<ExternalLinkResponse | null>(null);
	const [linkLoading, setLinkLoading] = useState(false);
	const [isApplying, setIsApplying] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [statusLoading, setStatusLoading] = useState(false);

	// Fetch MC link status and whitelist status when user is authenticated
	useEffect(() => {
		if (!user?.id || !isAuthenticated) {
			setMcLink(null);
			setStatus(null);
			setLinkLoading(false);
			setStatusLoading(false);
			return;
		}

		let cancelled = false;
		setLinkLoading(true);
		setStatusLoading(true);

		Promise.all([
			authService.checkLinkStatus(user.id),
			whitelistService.getMyStatus(serverId).catch(() => ({ status: null })),
		])
			.then(([linkResponse, statusResponse]) => {
				if (cancelled) return;

				// Handle Link
				if (linkResponse.links && Array.isArray(linkResponse.links)) {
					const mc = linkResponse.links.find((link: ExternalLinkResponse | unknown) => {
						if (typeof link !== 'object' || link === null) return false;
						const platform = (link as ExternalLinkResponse).platform;
						if (platform == null) return false;
						const platformStr = String(platform).toLowerCase().trim();
						return platformStr === 'mc' || platformStr === 'minecraft';
					});
					setMcLink((mc as ExternalLinkResponse) ?? null);
				} else {
					setMcLink(null);
				}

				// Handle Status
				setStatus(statusResponse?.status || null);
			})
			.catch((err) => {
				console.error('Failed to load whitelist data:', err);
				if (!cancelled) {
					setMcLink(null);
					setStatus(null);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLinkLoading(false);
					setStatusLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [user?.id, isAuthenticated, serverId]);

	if (!isWhitelist) return null;

	// Not authenticated: show hint button
	if (!authLoading && !isAuthenticated) {
		return (
			<Button
				variant="secondary"
				size="sm"
				className="mt-2 w-full text-xs bg-white/10 hover:bg-white/20 text-white/70 cursor-not-allowed"
				disabled
				title="Войдите, чтобы подать заявку"
			>
				Войдите, чтобы подать заявку
			</Button>
		);
	}

	if (statusLoading) {
		return <div className="mt-2 w-full h-8 bg-white/5 animate-pulse rounded" />;
	}

	if (status === 'approved') {
		return (
			<div className="mt-2 w-full text-center p-2 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
				Вы в вайтлисте ✅
			</div>
		);
	}

	if (status === 'pending') {
		return (
			<div className="mt-2 w-full text-center p-2 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
				Ваша заявка на рассмотрении ⏳
			</div>
		);
	}

	const handleClick = async () => {
		const nickname = getMinecraftNickname(mcLink);

		if (nickname) {
			// Scenario A: MC linked — auto-submit
			setIsApplying(true);
			setErrorMessage(null);
			setSuccessMessage(null);

			try {
				await whitelistService.apply(serverId, nickname);
				setSuccessMessage('Заявка успешно отправлена!');
				setStatus('pending'); // Optimistic update
				setTimeout(() => setSuccessMessage(null), 4000);
			} catch (err) {
				setErrorMessage(err instanceof Error ? err.message : 'Ошибка при отправке');
			} finally {
				setIsApplying(false);
			}
		} else {
			// Scenario B: MC not linked — open modal
			setModalOpen(true);
		}
	};

	const handleModalSuccess = () => {
		setSuccessMessage('Заявка успешно отправлена!');
		setStatus('pending'); // Optimistic update
		setTimeout(() => setSuccessMessage(null), 4000);
	};

	return (
		<>
			<div className="mt-2 space-y-2">
				{status === 'rejected' && (
					<div className="w-full text-center p-2 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium">
						Заявка отклонена ❌
					</div>
				)}

				<Button
					variant="secondary"
					size="sm"
					onClick={handleClick}
					disabled={linkLoading || isApplying}
					className="w-full text-xs bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
				>
					{linkLoading || isApplying
						? '...'
						: status === 'rejected'
							? 'Подать повторно'
							: 'Подать заявку в вайтлист'}
				</Button>
				{successMessage && <p className="text-xs text-green-400">{successMessage}</p>}
				{errorMessage && !modalOpen && <p className="text-xs text-red-400">{errorMessage}</p>}
			</div>

			<WhitelistApplyModal
				isOpen={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setErrorMessage(null);
				}}
				serverId={serverId}
				serverName={serverName}
				onSuccess={handleModalSuccess}
			/>
		</>
	);
}
