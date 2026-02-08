'use client';

import { useEffect, useState, useMemo } from 'react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ShopFilters } from '@/components/shop/shop-filters';
import { ShopItemCard } from '@/components/shop/shop-item-card';
import { PurchaseModal } from '@/components/shop/purchase-modal';
import { OrdersHistoryModal } from '@/components/shop/orders-history-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { shopService } from '@/lib/api/shop-service';
import { gameService } from '@/lib/game/game-service';
import { ShopCategory, ShopItem } from '@/types/shop';
import { GameServerPublic, GameTypeResponse } from '@/lib/api/generated';
import { useBalance } from '@/hooks/use-balance';

export default function ShopPage() {
	const [servers, setServers] = useState<GameServerPublic[]>([]);
	const [categories, setCategories] = useState<ShopCategory[]>([]);
	const [items, setItems] = useState<ShopItem[]>([]);
	const [gameTypes, setGameTypes] = useState<GameTypeResponse[]>([]);

	const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const { refreshBalance } = useBalance();

	// Load initial data
	useEffect(() => {
		async function loadData() {
			try {
				const [serversData, categoriesData, gameTypesData] = await Promise.all([
					gameService.getGameServers(),
					shopService.getCategories(),
					gameService.getGameTypes(),
				]);
				setServers(serversData);
				setCategories(categoriesData);
				setGameTypes(gameTypesData);
			} catch (error) {
				console.error('Failed to load shop data:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadData();
	}, []);

	// Load items when server changes
	useEffect(() => {
		async function loadItems() {
			try {
				setIsLoading(true);
				const itemsData = await shopService.getItems(selectedServerId || undefined);
				setItems(itemsData);
			} catch (error) {
				console.error('Failed to load items:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadItems();
	}, [selectedServerId]);

	const filteredItems = useMemo(() => {
		if (!selectedCategoryId) return items;
		// Assuming items have category_id, if not this filter might need adjustment
		// based on actual API response. For now, we'll try to filter if property exists.
		return items.filter((item) => {
			return item.category_id === selectedCategoryId;
		});
	}, [items, selectedCategoryId]);

	const handleBuyClick = (item: ShopItem) => {
		setSelectedItem(item);
		setIsPurchaseModalOpen(true);
	};

	const handlePurchaseSuccess = () => {
		setSuccessMessage('Товар успешно куплен! Зайдите на сервер, чтобы получить его.');
		refreshBalance();
	};

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
							Магазин
						</h1>
						<p className="text-lg text-white/60">Покупка предметов и привилегий</p>
					</div>
					<button
						onClick={() => setIsHistoryModalOpen(true)}
						className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium cursor-pointer backdrop-blur-md"
					>
						История покупок
					</button>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* Filters Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 rounded-xl">
							<ShopFilters
								servers={servers}
								categories={categories}
								selectedServerId={selectedServerId}
								selectedCategoryId={selectedCategoryId}
								onServerChange={setSelectedServerId}
								onCategoryChange={setSelectedCategoryId}
							/>
						</div>
					</div>

					{/* Items Grid */}
					<div className="lg:col-span-3">
						{isLoading ? (
							<div className="flex h-64 glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md items-center justify-center text-white/60">
								Загрузка товаров...
							</div>
						) : filteredItems.length > 0 ? (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
								{filteredItems.map((item) => (
									<ShopItemCard
										key={item.id}
										item={item}
										onBuy={handleBuyClick}
										gameTypes={gameTypes}
									/>
								))}
							</div>
						) : (
							<div className="flex h-64 items-center justify-center rounded-xl glass-card backdrop-blur-md border border-dashed border-white/10 bg-white/5 text-white/60">
								Товары не найдены
							</div>
						)}
					</div>
				</div>
			</main>

			<PurchaseModal
				isOpen={isPurchaseModalOpen}
				onClose={() => setIsPurchaseModalOpen(false)}
				item={selectedItem}
				selectedServerId={selectedServerId}
				servers={servers}
				onSuccess={handlePurchaseSuccess}
			/>

			<OrdersHistoryModal
				isOpen={isHistoryModalOpen}
				onClose={() => setIsHistoryModalOpen(false)}
				items={items}
				servers={servers}
			/>

			<ConfirmationModal
				isOpen={!!successMessage}
				onClose={() => setSuccessMessage(null)}
				onConfirm={() => setSuccessMessage(null)}
				title="Успешно!"
				message={successMessage || ''}
				confirmText="Отлично"
				cancelText="Закрыть" // Not really needed as confirm does same thing
			/>

			<Footer />
		</div>
	);
}
