'use client';

import { ShopCategory } from '@/types/shop';
import { GameServerPublic } from '@/lib/api/generated';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ShopFiltersProps {
	servers: GameServerPublic[];
	categories: ShopCategory[];
	selectedServerId: string | null;
	selectedCategoryId: string | null;
	onServerChange: (serverId: string | null) => void;
	onCategoryChange: (categoryId: string | null) => void;
	className?: string;
}

export function ShopFilters({
	servers,
	categories,
	selectedServerId,
	selectedCategoryId,
	onServerChange,
	onCategoryChange,
	className,
}: ShopFiltersProps) {
	return (
		<div className={cn('flex flex-col gap-6', className)}>
			{/* Server Selector */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-white/60">Сервер</label>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => onServerChange(null)}
						className={cn(
							'px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-normal text-left break-words',
							selectedServerId === null
								? 'bg-primary text-white'
								: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
						)}
					>
						Все серверы
					</button>
					{servers.map((server) => (
						<button
							key={server.id}
							onClick={() => onServerChange(server.id)}
							className={cn(
								'px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-normal text-left max-w-full break-words',
								selectedServerId === server.id
									? 'bg-primary text-white'
									: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
							)}
						>
							{server.name}
						</button>
					))}
				</div>
			</div>

			{/* Categories */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-white/60">Категории</label>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => onCategoryChange(null)}
						className={cn(
							'px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer',
							selectedCategoryId === null
								? 'bg-primary text-white'
								: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
						)}
					>
						Все
					</button>
					{categories.map((category) => (
						<button
							key={category.id}
							onClick={() => onCategoryChange(category.id)}
							className={cn(
								'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 cursor-pointer',
								selectedCategoryId === category.id
									? 'bg-primary text-white'
									: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
							)}
						>
							{category.icon_url && (
								<div className="relative w-4 h-4">
									<Image
										src={category.icon_url}
										alt=""
										fill
										className="object-contain"
										unoptimized
									/>
								</div>
							)}
							{category.name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
