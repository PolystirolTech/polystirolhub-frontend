'use client';

import { useState } from 'react';
import { CategoriesManager } from '@/components/admin/shop/categories-manager';
import { ItemsManager } from '@/components/admin/shop/items-manager';
import { OrdersManager } from '@/components/admin/shop/orders-manager';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function AdminShopPage() {
	const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'orders'>('items');

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold text-white mb-2">Управление магазином</h1>
						<p className="text-white/60">Настройка товаров и категорий магазина</p>
					</div>

					<div className="flex border-b border-white/10">
						<button
							onClick={() => setActiveTab('items')}
							className={cn(
								'px-6 py-3 text-sm font-medium transition-colors relative cursor-pointer',
								activeTab === 'items' ? 'text-primary' : 'text-white/60 hover:text-white'
							)}
						>
							Товары
							{activeTab === 'items' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
							)}
						</button>
						<button
							onClick={() => setActiveTab('categories')}
							className={cn(
								'px-6 py-3 text-sm font-medium transition-colors relative cursor-pointer',
								activeTab === 'categories' ? 'text-primary' : 'text-white/60 hover:text-white'
							)}
						>
							Категории
							{activeTab === 'categories' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
							)}
						</button>
						<button
							onClick={() => setActiveTab('orders')}
							className={cn(
								'px-6 py-3 text-sm font-medium transition-colors relative cursor-pointer',
								activeTab === 'orders' ? 'text-primary' : 'text-white/60 hover:text-white'
							)}
						>
							История
							{activeTab === 'orders' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
							)}
						</button>
					</div>

					<div className="pt-4">
						{activeTab === 'items' && <ItemsManager />}
						{activeTab === 'categories' && <CategoriesManager />}
						{activeTab === 'orders' && <OrdersManager />}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
