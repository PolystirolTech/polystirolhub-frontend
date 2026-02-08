'use client';

import { useEffect, useState } from 'react';
import { ShopOrder, ShopItem } from '@/types/shop';
import { GameServerPublic } from '@/lib/api/generated';
import { shopService } from '@/lib/api/shop-service';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface OrdersHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	items: ShopItem[];
	servers: GameServerPublic[];
}

export function OrdersHistoryModal({ isOpen, onClose, items, servers }: OrdersHistoryModalProps) {
	const [orders, setOrders] = useState<ShopOrder[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (isOpen) {
			loadOrders();
		}
	}, [isOpen]);

	const loadOrders = async () => {
		try {
			setIsLoading(true);
			const data = await shopService.getMyOrders();
			setOrders(data);
		} catch (error) {
			console.error('Failed to load orders:', error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	const getItemName = (itemId: string) => {
		const item = items.find((i) => i.id === itemId);
		return item ? item.name : 'Неизвестный товар';
	};

	const getItemImage = (itemId: string) => {
		const item = items.find((i) => i.id === itemId);
		return item?.image_url;
	};

	const getServerName = (serverId: string) => {
		const server = servers.find((s) => s.id === serverId);
		return server ? server.name : 'Неизвестный сервер';
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative max-w-4xl w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 rounded-xl flex flex-col max-h-[80vh]">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-white">История покупок</h2>
					<button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
						✕
					</button>
				</div>

				<div className="flex-1 overflow-y-auto pr-2">
					{isLoading ? (
						<div className="flex justify-center items-center h-32 text-white/60">Загрузка...</div>
					) : orders.length === 0 ? (
						<div className="flex justify-center items-center h-32 text-white/60">
							История покупок пуста
						</div>
					) : (
						<div className="space-y-3">
							{orders.map((order) => (
								<div
									key={order.id}
									className="bg-black/20 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
								>
									<div className="h-12 w-12 bg-white/5 rounded-lg flex-shrink-0 overflow-hidden relative">
										{getItemImage(order.item_id) ? (
											<Image
												src={getItemImage(order.item_id)!}
												alt=""
												fill
												className="object-contain image-pixelated"
												style={{ imageRendering: 'pixelated' }}
												unoptimized
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-xs text-white/20">
												?
											</div>
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="font-medium text-white truncate">
											{getItemName(order.item_id)}
										</div>
										<div className="text-sm text-white/60 truncate">
											Сервер: {getServerName(order.game_server_id)}
										</div>
										<div className="text-xs text-white/40 mt-1">{formatDate(order.created_at)}</div>
									</div>

									<div className="flex flex-col items-end gap-2">
										<div className="flex items-center gap-1.5">
											<span className="font-bold text-white">{order.price_paid}</span>
											<Image
												src="/coin.png"
												alt="Coins"
												width={16}
												height={16}
												className="h-4 w-4 object-contain"
											/>
										</div>
										<div
											className={cn(
												'px-2 py-0.5 rounded text-xs font-medium',
												order.status === 'DELIVERED'
													? 'bg-green-500/20 text-green-400'
													: 'bg-yellow-500/20 text-yellow-400'
											)}
										>
											{order.status === 'DELIVERED' ? 'Выдано' : 'Ожидание'}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
