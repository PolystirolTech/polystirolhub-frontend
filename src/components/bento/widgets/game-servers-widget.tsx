'use client';

export function GameServersWidget() {
	// TODO: Подключить реальные серверы
	const servers = [
		{ id: 1, name: 'Survival #1', players: 24, maxPlayers: 50, status: 'online' },
		{ id: 2, name: 'Creative #1', players: 12, maxPlayers: 30, status: 'online' },
		{ id: 3, name: 'PvP Arena', players: 8, maxPlayers: 20, status: 'online' },
	];

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Игровые серверы</h3>
			<div className="space-y-2">
				{servers.map((server) => (
					<div
						key={server.id}
						className="flex items-center justify-between rounded-lg bg-white/5 p-3"
					>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<span
									className={`h-2 w-2 rounded-full ${
										server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
									}`}
								/>
								<span className="text-sm font-medium text-white">{server.name}</span>
							</div>
						</div>
						<div className="text-xs text-white/60">
							{server.players}/{server.maxPlayers}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
