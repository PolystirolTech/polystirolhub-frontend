'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import type { NotificationResponse } from '@/lib/api';

interface UseNotificationsOptions {
	enablePolling?: boolean;
	pollingInterval?: number;
}

const DEFAULT_POLLING_INTERVAL = 60000; // 60 секунд

export function useNotifications(options: UseNotificationsOptions = {}) {
	const { enablePolling = true, pollingInterval = DEFAULT_POLLING_INTERVAL } = options;
	const { isAuthenticated } = useAuth();

	const [recentNotifications, setRecentNotifications] = useState<NotificationResponse[]>([]);
	const [allNotifications, setAllNotifications] = useState<NotificationResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const skipRef = useRef(0);

	const fetchRecent = useCallback(async () => {
		if (!isAuthenticated) {
			setRecentNotifications([]);
			setIsLoading(false);
			return;
		}

		try {
			setError(null);
			const notifications = await notificationService.getRecentNotifications();
			setRecentNotifications(notifications);
		} catch (err) {
			console.error('Failed to fetch recent notifications:', err);
			setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления');
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	const fetchAll = useCallback(
		async (reset: boolean = false) => {
			if (!isAuthenticated) {
				setAllNotifications([]);
				setIsLoading(false);
				skipRef.current = 0;
				return;
			}

			try {
				if (reset) {
					setIsLoading(true);
					skipRef.current = 0;
				} else {
					setIsLoadingMore(true);
				}
				setError(null);

				const limit = 50;
				const currentSkip = skipRef.current;
				const notifications = await notificationService.getAllNotifications(currentSkip, limit);

				if (reset) {
					setAllNotifications(notifications);
				} else {
					setAllNotifications((prev) => [...prev, ...notifications]);
				}

				// Обновляем skip для следующей загрузки
				skipRef.current = currentSkip + notifications.length;

				// Проверяем, есть ли еще данные
				setHasMore(notifications.length === limit);
			} catch (err) {
				console.error('Failed to fetch all notifications:', err);
				setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления');
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[isAuthenticated]
	);

	// Загрузка последних уведомлений при монтировании
	useEffect(() => {
		fetchRecent();
	}, [fetchRecent]);

	// Polling для последних уведомлений
	useEffect(() => {
		if (!isAuthenticated || !enablePolling) {
			return;
		}

		const intervalId = setInterval(() => {
			fetchRecent();
		}, pollingInterval);

		return () => clearInterval(intervalId);
	}, [isAuthenticated, enablePolling, pollingInterval, fetchRecent]);

	return {
		recentNotifications,
		allNotifications,
		isLoading,
		isLoadingMore,
		error,
		hasMore,
		fetchRecent,
		fetchAll,
		refresh: () => {
			fetchRecent();
			fetchAll(true);
		},
	};
}
