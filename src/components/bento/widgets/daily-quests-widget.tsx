'use client';

export function DailyQuestsWidget() {
	// TODO: Подключить реальные квесты
	const quests = [
		{ id: 1, title: 'Играй 1 час', progress: 45, max: 60, reward: '100 XP' },
		{ id: 2, title: 'Зайди на сервер', progress: 1, max: 1, reward: '50 XP' },
		{ id: 3, title: 'Получи достижение', progress: 0, max: 1, reward: '200 XP' },
	];

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Ежедневные квесты</h3>
			<div className="space-y-3">
				{quests.map((quest) => (
					<div key={quest.id} className="rounded-lg bg-white/5 p-2">
						<div className="mb-1 flex items-center justify-between">
							<span className="text-xs font-medium text-white">{quest.title}</span>
							<span className="text-xs text-white/60">{quest.reward}</span>
						</div>
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full bg-primary transition-all"
								style={{ width: `${(quest.progress / quest.max) * 100}%` }}
							/>
						</div>
						<p className="mt-1 text-xs text-white/40">
							{quest.progress} / {quest.max}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
