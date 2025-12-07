import { Header } from '@/components/layout/header';

export default function StatsPage() {
	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Статистика
					</h1>
					<p className="text-lg text-white/60">Ваша статистика и достижения</p>
				</div>

				<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8">
					<p className="text-white/60">Страница в разработке</p>
				</div>
			</main>
		</div>
	);
}
