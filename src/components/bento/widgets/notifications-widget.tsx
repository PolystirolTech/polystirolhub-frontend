'use client';

export function NotificationsWidget() {
	// TODO: Подключить реальные уведомления
	const notifications = [
		{ id: 1, text: 'Новое достижение разблокировано!', time: '5 мин назад' },
		{ id: 2, text: 'Вы получили новый уровень', time: '1 час назад' },
	];

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Уведомления</h3>
			<div className="space-y-2">
				{notifications.length > 0 ? (
					notifications.map((notification) => (
						<div
							key={notification.id}
							className="rounded-lg bg-white/5 p-2 text-xs text-white/80"
						>
							<p>{notification.text}</p>
							<p className="mt-1 text-white/40">{notification.time}</p>
						</div>
					))
				) : (
					<p className="text-xs text-white/40">Нет новых уведомлений</p>
				)}
			</div>
		</div>
	);
}
