'use client';

export function ActivityWidget() {
	// TODO: Подключить реальную активность
	const activities = [
		{ id: 1, user: 'Player1', action: 'зашел на сервер', time: '2 мин назад' },
		{ id: 2, user: 'Player2', action: 'получил достижение', time: '5 мин назад' },
		{ id: 3, user: 'Player3', action: 'завершил квест', time: '10 мин назад' },
	];

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Активность</h3>
			<div className="space-y-2">
				{activities.map((activity) => (
					<div key={activity.id} className="rounded-lg bg-white/5 p-2 text-xs text-white/80">
						<span className="font-medium text-white">{activity.user}</span> {activity.action}
						<p className="mt-1 text-white/40">{activity.time}</p>
					</div>
				))}
			</div>
		</div>
	);
}
