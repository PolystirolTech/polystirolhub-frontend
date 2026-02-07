'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import {
	formatNotificationTime,
	getNotificationIcon,
	formatNotificationMessage,
	formatRewardText,
} from '@/lib/notifications';
import type { NotificationResponse } from '@/lib/api';
import type {
	LevelUpMetaData,
	AchievementUnlockedMetaData,
	BadgeEarnedMetaData,
} from '@/lib/notifications/types';

interface NotificationsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
	const { allNotifications, isLoading, isLoadingMore, error, hasMore, fetchAll } = useNotifications(
		{ enablePolling: false }
	);

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

	// Загружаем все уведомления при открытии модального окна
	useEffect(() => {
		if (isOpen) {
			fetchAll(true);
		}
	}, [isOpen, fetchAll]);

	// Настройка бесконечной прокрутки
	useEffect(() => {
		if (!isOpen || !hasMore || isLoading || isLoadingMore) {
			return;
		}

		// Очищаем предыдущий observer
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		// Создаем новый observer
		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					fetchAll(false);
				}
			},
			{ threshold: 0.1 }
		);

		if (loadMoreTriggerRef.current) {
			observerRef.current.observe(loadMoreTriggerRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [isOpen, hasMore, isLoading, isLoadingMore, fetchAll]);

	// Закрытие по Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// Блокировка скролла body при открытом модальном окне
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative max-w-2xl w-full max-h-[90vh] p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl md:text-2xl font-bold text-white">Уведомления</h2>
					<button
						onClick={onClose}
						className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
						aria-label="Закрыть"
					>
						×
					</button>
				</div>

				{/* Content */}
				<div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
					{isLoading && allNotifications.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
						</div>
					) : error && allNotifications.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-white/60">{error}</p>
						</div>
					) : allNotifications.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-white/60">Нет уведомлений</p>
						</div>
					) : (
						<>
							{allNotifications.map((notification) => (
								<NotificationItem key={notification.id} notification={notification} />
							))}

							{/* Trigger для бесконечной прокрутки */}
							<div ref={loadMoreTriggerRef} className="h-4" />

							{isLoadingMore && (
								<div className="flex items-center justify-center py-4">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
								</div>
							)}

							{!hasMore && allNotifications.length > 0 && (
								<div className="text-center py-4">
									<p className="text-xs text-white/40">Все уведомления загружены</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

interface NotificationItemProps {
	notification: NotificationResponse;
}

function NotificationItem({ notification }: NotificationItemProps) {
	const icon = getNotificationIcon(notification.notificationType as string);
	const message = formatNotificationMessage(notification);
	const time = formatNotificationTime(notification.createdAt as string | null);
	const rewardText = formatRewardText(notification.rewardXp, notification.rewardBalance);
	const metaData = notification.metaData as
		| LevelUpMetaData
		| AchievementUnlockedMetaData
		| BadgeEarnedMetaData
		| undefined;

	return (
		<div className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className="text-2xl flex-shrink-0">{icon}</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title */}
					{notification.title && (
						<h3 className="text-sm font-semibold text-white mb-1">{notification.title}</h3>
					)}

					{/* Message */}
					<p className="text-sm text-white/80 mb-2">{message}</p>

					{/* Meta data */}
					{notification.notificationType === 'level_up' &&
						metaData &&
						typeof metaData === 'object' && (
							<div className="text-xs text-white/60 mb-2">
								{'old_level' in metaData && 'new_level' in metaData && (
									<>
										Уровень {metaData.old_level as number} → {metaData.new_level as number}
									</>
								)}
							</div>
						)}

					{/* Rewards */}
					{rewardText && <div className="text-xs text-primary font-medium mb-2">{rewardText}</div>}

					{/* Time */}
					<p className="text-xs text-white/40">{time}</p>
				</div>
			</div>
		</div>
	);
}
