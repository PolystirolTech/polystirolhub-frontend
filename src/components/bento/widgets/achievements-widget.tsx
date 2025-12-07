'use client';

export function AchievementsWidget() {
	// TODO: Подключить реальные достижения
	const allAchievements = [
		{ id: 1, name: 'Первые шаги', unlocked: true, progress: 100, maxProgress: 100, icon: '🏆' },
		{ id: 2, name: 'Мастер игры', unlocked: true, progress: 100, maxProgress: 100, icon: '⭐' },
		{ id: 3, name: 'Легенда', unlocked: false, progress: 75, maxProgress: 100, icon: '👑' },
		{ id: 4, name: 'Новичок', unlocked: true, progress: 100, maxProgress: 100, icon: '🎯' },
		{ id: 5, name: 'Ветеран', unlocked: false, progress: 60, maxProgress: 100, icon: '🛡️' },
		{ id: 6, name: 'Исследователь', unlocked: false, progress: 45, maxProgress: 100, icon: '🗺️' },
		{ id: 7, name: 'Коллекционер', unlocked: false, progress: 30, maxProgress: 100, icon: '📦' },
	];

	// Фильтруем неразблокированные и сортируем по прогрессу (ближайшие к разблокированию)
	const nearestAchievements = allAchievements
		.filter((a) => !a.unlocked)
		.sort((a, b) => {
			const progressA = (a.progress / a.maxProgress) * 100;
			const progressB = (b.progress / b.maxProgress) * 100;
			return progressB - progressA;
		})
		.slice(0, 4);

	if (nearestAchievements.length === 0) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
				<p className="text-xs text-white/40">Все достижения разблокированы!</p>
			</div>
		);
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Достижения</h3>
			<div className="space-y-2">
				{nearestAchievements.map((achievement) => {
					const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
					return (
						<div
							key={achievement.id}
							className="rounded-lg bg-white/5 p-2"
						>
							<div className="mb-1 flex items-center gap-2">
								<div className="text-lg">{achievement.icon}</div>
								<span className="flex-1 text-xs font-medium text-white">{achievement.name}</span>
								<span className="text-xs text-white/60">{Math.round(progressPercent)}%</span>
							</div>
							<div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
								<div
									className="h-full bg-primary transition-all"
									style={{ width: `${progressPercent}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
