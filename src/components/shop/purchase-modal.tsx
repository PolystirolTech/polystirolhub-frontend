'use client';

import { useEffect, useState } from 'react';
import { ShopItem } from '@/types/shop';
import { GameServerPublic } from '@/lib/api/generated';
import { shopService } from '@/lib/api/shop-service';
import { profileService } from '@/lib/api/profile-service';
import { useBalance } from '@/hooks/use-balance';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PurchaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: ShopItem | null;
	selectedServerId: string | null;
	servers: GameServerPublic[];
	onSuccess: () => void;
}

export function PurchaseModal({
	isOpen,
	onClose,
	item,
	selectedServerId,
	servers,
	onSuccess,
}: PurchaseModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [targetServerId, setTargetServerId] = useState<string | null>(selectedServerId);
	const [validationError, setValidationError] = useState<string | null>(null);
	const { balance, isLoading: isBalanceLoading, refreshBalance } = useBalance();
	const { user } = useAuth();

	// Filter available servers for this item if it has restrictions
	const availableServers = servers.filter((server) => {
		if (!item) return false;

		// If no restrictions, available on all
		if (
			(!item.game_server_ids || item.game_server_ids.length === 0) &&
			(!item.game_type_ids || item.game_type_ids.length === 0)
		) {
			return true;
		}

		// Check specific server ID
		if (item.game_server_ids && item.game_server_ids.includes(server.id)) {
			return true;
		}

		// Check game type ID
		// Note: server.gameType might be an object or ID depending on API response,
		// but GameServerPublic type says gameType: GameTypeResponse which has id.
		if (
			item.game_type_ids &&
			server.gameType &&
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			item.game_type_ids.includes((server.gameType as any).id || (server.gameType as any))
		) {
			return true;
		}

		return false;
	});

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen && item) {
			setError(null);
			setValidationError(null);

			// Auto-select if only one server is available or if selectedServerId is valid for this item
			if (selectedServerId && availableServers.some((s) => s.id === selectedServerId)) {
				setTargetServerId(selectedServerId);
			} else if (availableServers.length === 1) {
				setTargetServerId(availableServers[0].id);
			} else {
				setTargetServerId(null);
			}

			checkRequirements();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, item, selectedServerId, availableServers.length]);

	const checkRequirements = async () => {
		if (!item) return;

		// Check balance
		if (!isBalanceLoading && balance !== null && balance < item.price) {
			setValidationError('Недостаточно средств на балансе');
			return;
		}

		// Check platform requirements
		if (item.required_platform && user) {
			try {
				// Use user.id (UUID) to fetch profile to avoid issues with special characters in username
				const profile = await profileService.getProfile(user.id);

				// Check if user has the required platform linked
				// We check both linked_accounts and specific stats if applicable
				let hasPlatform = false;
				const requiredPlatform = item.required_platform.toLowerCase();

				if (requiredPlatform === 'steam') {
					hasPlatform = profile.header.linked_accounts?.some(
						(acc) => acc.platform.toLowerCase() === 'steam'
					);
				} else if (requiredPlatform === 'minecraft') {
					// Check linked accounts or if minecraft stats exist (implies linked)
					// Also check for 'mc', 'java', 'bedrock' just in case
					const hasLinkedMc = profile.header.linked_accounts?.some((acc) =>
						['minecraft', 'mc', 'java', 'bedrock'].includes(acc.platform.toLowerCase())
					);
					const hasMcStats = profile.minecraft_stats && profile.minecraft_stats.length > 0;
					hasPlatform = hasLinkedMc || hasMcStats;
				}

				if (!hasPlatform) {
					setValidationError(
						`Для покупки этого товара необходимо привязать ${
							requiredPlatform === 'steam' ? 'Steam' : 'Minecraft'
						} аккаунт в настройках профиля`
					);
				}
			} catch (err) {
				console.error('Failed to check profile:', err);
				// If check fails, we don't block here, but backend might reject.
				// Or we could set a warning.
			}
		}
	};

	const handleBuy = async () => {
		if (!item) return;
		if (!targetServerId) {
			setError('Выберите сервер для получения товара');
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			await shopService.buyItem({
				item_id: item.id,
				game_server_id: targetServerId,
			});

			await refreshBalance();
			onSuccess();
			onClose();
		} catch (err) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const message = (err as any).message || 'Произошла ошибка при покупке';

			if (message.includes('Insufficient funds')) {
				setError('Недостаточно средств');
			} else if (message.includes('Linked Steam')) {
				setError('Необходимо привязать Steam аккаунт в настройках');
			} else if (message.includes('Linked Minecraft')) {
				setError('Необходимо привязать Minecraft аккаунт в настройках');
			} else {
				setError(message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen || !item) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 rounded-xl">
				<h2 className="mb-4 text-xl font-bold text-white">Подтверждение покупки</h2>

				<div className="mb-6 flex gap-4">
					<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-black/20 p-2 relative">
						{item.image_url && (
							<Image
								src={item.image_url}
								alt={item.name}
								fill
								className="object-contain image-pixelated"
								style={{ imageRendering: 'pixelated' }}
								unoptimized
							/>
						)}
					</div>
					<div>
						<h3 className="font-bold text-white">{item.name}</h3>
						<p className="text-sm text-white/60">{item.description}</p>
						<div className="mt-2 flex items-center gap-1.5">
							<span className="font-bold text-primary">{item.price}</span>
							<Image
								src="/coin.png"
								alt="Coins"
								width={16}
								height={16}
								className="h-4 w-4 object-contain"
							/>
						</div>
					</div>
				</div>

				<div className="mb-6 space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-white/60">Выберите сервер</label>
						<div className="flex flex-wrap gap-2">
							{availableServers.map((server) => (
								<button
									key={server.id}
									onClick={() => setTargetServerId(server.id)}
									className={cn(
										'flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer text-left h-auto min-h-[3rem] w-full',
										targetServerId === server.id
											? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]'
											: 'bg-black/20 border-white/5 text-white/60 hover:bg-black/30 hover:border-white/10 hover:text-white'
									)}
								>
									<span className="whitespace-normal break-words mr-2">{server.name}</span>
									{targetServerId === server.id && (
										<div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
									)}
								</button>
							))}
						</div>
						{availableServers.length === 0 && (
							<p className="text-xs text-red-400">Нет доступных серверов для этого товара</p>
						)}
					</div>

					{validationError && (
						<div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
							{validationError}
						</div>
					)}

					{error && (
						<div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
							{error}
						</div>
					)}
				</div>

				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors cursor-pointer"
					>
						Отмена
					</button>
					<button
						onClick={handleBuy}
						disabled={isLoading || !!validationError || !targetServerId}
						className={cn(
							'px-4 py-2 rounded-lg text-white font-medium transition-colors cursor-pointer',
							isLoading || !!validationError || !targetServerId
								? 'bg-primary/50 cursor-not-allowed'
								: 'bg-primary hover:bg-primary/90'
						)}
					>
						{isLoading ? 'Покупка...' : 'Купить'}
					</button>
				</div>
			</div>
		</div>
	);
}
