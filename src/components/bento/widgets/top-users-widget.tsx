'use client';

export function TopUsersWidget() {
	// TODO: Подключить реальный топ игроков
	const topUsers = [
		{ rank: 1, username: 'Player1', level: 50, xp: 125000 },
		{ rank: 2, username: 'Player2', level: 48, xp: 118000 },
		{ rank: 3, username: 'Player3', level: 45, xp: 110000 },
		{ rank: 4, username: 'Player4', level: 42, xp: 105000 },
		{ rank: 5, username: 'Player5', level: 40, xp: 98000 },
	];

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Топ игроков</h3>
			<div className="space-y-2">
				{topUsers.map((user) => (
					<div
						key={user.rank}
						className="flex items-center justify-between rounded-lg bg-white/5 p-2"
					>
						<div className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
								{user.rank}
							</span>
							<span className="text-sm font-medium text-white">{user.username}</span>
						</div>
						<div className="items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
							Lv.{user.level}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
