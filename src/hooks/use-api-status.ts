/**
 * Custom hook for monitoring API health status
 */

import { useState, useEffect } from 'react';

export type ApiStatus = 'online' | 'offline' | 'checking';

export interface ApiStatusResult {
    status: ApiStatus;
    message: string;
    lastChecked: Date | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

export function useApiStatus(): ApiStatusResult {
    const [status, setStatus] = useState<ApiStatus>('checking');
    const [message, setMessage] = useState<string>('Проверка...');
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

                const response = await fetch(`${API_BASE_URL}/health`, {
                    method: 'GET',
                    signal: controller.signal,
                    cache: 'no-store',
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setStatus('online');
                    setMessage(data.status === 'healthy' ? 'GUCCI' : 'GUCCI');
                    setLastChecked(new Date());
                } else {
                    setStatus('offline');
                    setMessage(`Ошибка ${response.status}`);
                    setLastChecked(new Date());
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    setStatus('offline');
                    setMessage('Таймаут');
                } else {
                    setStatus('offline');
                    setMessage('Недоступен');
                }
                setLastChecked(new Date());
            }
        };

        // Initial check
        checkApiHealth();

        // Set up periodic checks
        const intervalId = setInterval(checkApiHealth, HEALTH_CHECK_INTERVAL);

        // Cleanup
        return () => clearInterval(intervalId);
    }, []);

    return { status, message, lastChecked };
}
