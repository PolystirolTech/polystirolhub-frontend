'use client';

import { ShopItem } from '@/types/shop';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { GameTypeResponse } from '@/lib/api/generated';

interface ShopItemCardProps {
	item: ShopItem;
	onBuy: (item: ShopItem) => void;
	className?: string;
	gameTypes?: GameTypeResponse[];
}

export function ShopItemCard({ item, onBuy, className, gameTypes }: ShopItemCardProps) {
	// Determine what to show in the badge
	let badgeText = '';
	if (item.game_type_ids && item.game_type_ids.length > 0 && gameTypes) {
		// Show first available game type name
		const type = gameTypes.find((t) => t.id === item.game_type_ids![0]);
		if (type) badgeText = type.name;
	} else if (item.game_server_ids && item.game_server_ids.length > 0) {
		// If specific servers but no types, maybe show "Specific Servers" or similar
		// But user asked for "тип сервера". If we can't resolve type, maybe fallback?
		// Let's leave it empty or show "Server"
		badgeText = 'Server';
	} else {
		badgeText = 'Global';
	}

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

				<div className="mt-auto flex items-center justify-between gap-2 pt-2">
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

					<button
						onClick={() => onBuy(item)}
						className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary hover:text-white cursor-pointer"
					>
						Купить
					</button>
				</div>
			</div>

			{/* Game Type Badge */}
			{badgeText && (
				<div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
					{badgeText}
				</div>
			)}
		</div>
	);
}
