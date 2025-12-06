import { Header } from '@/components/layout/header';

export default function Home() {
	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
					{/* Main Content Area - Placeholder for future Bento Grid */}
					<div className="glass-card bg-[var(--color-white)]/5 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10 text-center md:col-span-12">
						<h1 className="mb-4 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
							Это главная страница <span className="text-primary">polystirolhub</span>
						</h1>
						<p className="max-w-2xl text-lg text-muted">
							Здесь будет всё что связано с Полистиrolом.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
