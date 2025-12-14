'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/hooks/use-notifications';
import {
	formatNotificationTime,
	getNotificationIcon,
	formatNotificationMessage,
	formatRewardText,
} from '@/lib/notifications';
import { NotificationsModal } from '@/components/notifications/notifications-modal';

export function NotificationsWidget() {
	const { isAuthenticated } = useAuth();
	const { recentNotifications, isLoading } = useNotifications({ enablePolling: true });
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (!isAuthenticated) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Уведомления</h3>
				<p className="text-xs text-white/60">Войдите для просмотра уведомлений</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Уведомления</h3>
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				onClick={() => setIsModalOpen(true)}
				className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:border-white/20"
			>
				<h3 className="mb-3 text-sm font-bold text-white">Уведомления</h3>
				<div className="space-y-2">
					{recentNotifications.length > 0 ? (
						recentNotifications.map((notification) => {
							const icon = getNotificationIcon(notification.notificationType as string);
							const message = formatNotificationMessage(notification);
							const time = formatNotificationTime(notification.createdAt as string | null);
							const rewardText = formatRewardText(
								notification.rewardXp,
								notification.rewardBalance
							);

							return (
								<div
									key={notification.id}
									className="rounded-lg bg-white/5 p-2 text-xs text-white/80"
								>
									<div className="flex items-start gap-2">
										<span className="text-base flex-shrink-0">{icon}</span>
										<div className="flex-1 min-w-0">
											<p className="truncate">{message}</p>
											{rewardText && <p className="mt-1 text-primary font-medium">{rewardText}</p>}
											<p className="mt-1 text-white/40">{time}</p>
										</div>
									</div>
								</div>
							);
						})
					) : (
						<p className="text-xs text-white/40">Нет новых уведомлений</p>
					)}
				</div>
			</div>

			<NotificationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</>
	);
}
