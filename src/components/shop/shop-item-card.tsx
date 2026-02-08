'use client';

import { ShopItem } from '@/types/shop';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { GameServerPublic, GameTypeResponse } from '@/lib/api/generated';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface ShopItemCardProps {
	item: ShopItem;
	onBuy: (item: ShopItem) => void;
	className?: string;
	gameTypes?: GameTypeResponse[];
	servers?: GameServerPublic[];
}

export function ShopItemCard({ item, onBuy, className, gameTypes, servers }: ShopItemCardProps) {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	// Collect unique game types
	const uniqueGameTypes = new Set<string>();

	// 1. Add explicitly linked game types
	if (item.game_type_ids && gameTypes) {
		item.game_type_ids.forEach((id) => {
			const type = gameTypes.find((t) => t.id === id);
			if (type) uniqueGameTypes.add(type.name);
		});
	}

	// 2. Add game types from linked servers
	if (item.game_server_ids && servers) {
		item.game_server_ids.forEach((serverId) => {
			const server = servers.find((s) => s.id === serverId);
			if (server) {
				// Try to get game type name from various possible locations
				// 1. server.gameType.name (standard)
				// 2. server.gameType (if it's just a string ID - though unlikely with generated client)
				// 3. server.game_type.name (if raw JSON leaked through)

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const rawServer = server as any;
				const gameType = rawServer.gameType || rawServer.game_type;

				let typeName: string | undefined;

				if (gameType && typeof gameType === 'object' && 'name' in gameType) {
					typeName = gameType.name;
				} else if (gameTypes && typeof gameType === 'string') {
					// ID reference
					const type = gameTypes.find((t) => t.id === gameType);
					if (type) typeName = type.name;
				}

				if (typeName) {
					uniqueGameTypes.add(typeName);
				}
			}
		});
	}

	const badges = Array.from(uniqueGameTypes);
	const isGlobal =
		(!item.game_server_ids || item.game_server_ids.length === 0) &&
		(!item.game_type_ids || item.game_type_ids.length === 0);

	// Fallback: if not global but no badges found (e.g. server not found or type missing), show "Server"
	const showGenericServerBadge = !isGlobal && badges.length === 0;

	return (
		<div
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-xl glass-card backdrop-blur-md bg-[var(--color-secondary)]/40 border border-white/5 transition-all hover:bg-[var(--color-secondary)]/60 hover:border-white/10 hover:-translate-y-1',
				className
			)}
		>
			{/* Image */}
			<div className="aspect-square w-full overflow-hidden bg-black/20 p-3 flex items-center justify-center relative">
				{item.image_url ? (
					<Image
						src={item.image_url}
						alt={item.name}
						fill
						className="object-contain transition-transform duration-300 image-pixelated p-2"
						style={{ imageRendering: 'pixelated' }}
						unoptimized
					/>
				) : (
					<div className="text-white/20">No Image</div>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-3">
				<div className="mb-2">
					<h3 className="font-bold text-sm text-white transition-colors line-clamp-1">
						{item.name}
					</h3>
					<p className="text-xs text-white/60 line-clamp-2">{item.description}</p>
				</div>

				<div className="mt-auto flex flex-col gap-3 pt-2">
					<div className="flex flex-col">
						<span className="text-[10px] text-white/40 uppercase tracking-wider">Цена</span>
						<div className="flex items-center gap-1">
							<span className="font-bold text-sm text-white">{item.price}</span>
							<Image
								src="/coin.png"
								alt="Coins"
								width={14}
								height={14}
								className="h-3.5 w-3.5 object-contain"
							/>
						</div>
					</div>

					{isAuthenticated ? (
						<button
							onClick={() => onBuy(item)}
							className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-primary hover:text-white cursor-pointer"
						>
							Купить
						</button>
					) : (
						<button
							onClick={() => router.push('/login')}
							className="w-full rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white cursor-pointer border border-white/5"
						>
							Войти
						</button>
					)}
				</div>
			</div>

			{/* Game Type Badges */}
			<div className="absolute top-2 right-2 flex flex-col items-end gap-1">
				{isGlobal ? (
					<div className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm border border-white/10">
						Global
					</div>
				) : badges.length > 0 ? (
					badges.map((badge) => (
						<div
							key={badge}
							className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm border border-white/10 max-w-[150px] truncate"
						>
							{badge}
						</div>
					))
				) : showGenericServerBadge ? (
					<div className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm border border-white/10">
						Server
					</div>
				) : null}
			</div>
		</div>
	);
}
