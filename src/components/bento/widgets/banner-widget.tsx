export function BannerWidget() {
	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 sm:p-6 shadow-lg">
			<h1 className="text-lg sm:text-2xl font-bold text-white break-words" data-easter-egg-trigger>
				Добро пожаловать в PolystirolHub
			</h1>
			<p className="mt-2 text-sm text-white/80">Центральный хаб для всех игроков</p>
		</div>
	);
}
