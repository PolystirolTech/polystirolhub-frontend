'use client';

import { useState, useEffect } from 'react';
import { ShopOrder, ShopItem } from '@/types/shop';
import { GameServerPublic } from '@/lib/api/generated';
import { shopService } from '@/lib/api/shop-service';
import { gameService } from '@/lib/game/game-service';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function OrdersManager() {
	const [orders, setOrders] = useState<ShopOrder[]>([]);
	const [items, setItems] = useState<ShopItem[]>([]);
	const [servers, setServers] = useState<GameServerPublic[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [offset, setOffset] = useState(0);
	const limit = 20;

	useEffect(() => {
		loadInitialData();
	}, []);

	useEffect(() => {
		loadOrders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [offset]);

	const loadInitialData = async () => {
		try {
			const [itemsData, serversData] = await Promise.all([
				shopService.getItems(),
				gameService.getGameServers(),
			]);
			setItems(itemsData);
			setServers(serversData);
		} catch (error) {
			console.error('Failed to load initial data:', error);
		}
	};

	const loadOrders = async () => {
		try {
			setIsLoading(true);
			const data = await shopService.getAdminOrders(limit, offset);
			setOrders(data);
		} catch (error) {
			console.error('Failed to load orders:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getItemName = (itemId: string) => {
		const item = items.find((i) => i.id === itemId);
		return item ? item.name : itemId;
	};

	const getServerName = (serverId: string) => {
		const server = servers.find((s) => s.id === serverId);
		return server ? server.name : serverId;
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
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-white">История покупок</h2>
				<div className="flex gap-2">
					<button
						onClick={() => setOffset(Math.max(0, offset - limit))}
						disabled={offset === 0 || isLoading}
						className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Назад
					</button>
					<button
						onClick={() => setOffset(offset + limit)}
						disabled={orders.length < limit || isLoading}
						className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Вперед
					</button>
				</div>
			</div>

			<div className="glass-card bg-[var(--color-secondary)]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-white/60">
						<thead className="bg-white/5 text-white uppercase font-medium">
							<tr>
								<th className="px-6 py-4">Дата</th>
								<th className="px-6 py-4">Пользователь</th>
								<th className="px-6 py-4">Товар</th>
								<th className="px-6 py-4">Сервер</th>
								<th className="px-6 py-4">Цена</th>
								<th className="px-6 py-4">Статус</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{orders.map((order) => (
								<tr key={order.id} className="hover:bg-white/5 transition-colors">
									<td className="px-6 py-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
									<td className="px-6 py-4 font-mono text-xs">{order.user_id}</td>
									<td className="px-6 py-4 font-medium text-white">{getItemName(order.item_id)}</td>
									<td className="px-6 py-4">{getServerName(order.game_server_id)}</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-1.5">
											<span className="font-bold text-white">{order.price_paid}</span>
											<Image
												src="/coin.png"
												alt="Coins"
												width={14}
												height={14}
												className="h-3.5 w-3.5 object-contain"
											/>
										</div>
									</td>
									<td className="px-6 py-4">
										<span
											className={cn(
												'px-2 py-1 rounded text-xs font-medium',
												order.status === 'DELIVERED'
													? 'bg-green-500/20 text-green-400'
													: 'bg-yellow-500/20 text-yellow-400'
											)}
										>
											{order.status}
										</span>
									</td>
								</tr>
							))}
							{orders.length === 0 && !isLoading && (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-white/40">
										История пуста
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
