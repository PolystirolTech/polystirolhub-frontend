import type { Metadata } from 'next';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
	title: 'Shop - PolystirolHub',
	description: 'Shop for PolystirolHub',
};

export default function ShopPage() {
	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Магазин
					</h1>
					<p className="text-lg text-white/60">Покупка предметов и улучшений</p>
				</div>

				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8">
					<p className="text-white/60">Страница в разработке</p>
				</div>
			</main>
			<Footer />
		</div>
	);
}
