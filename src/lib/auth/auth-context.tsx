'use client';

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Handles user session management, login/logout, and auto-refresh on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from './auth-service';
import type { AuthContextType, User, OAuthProvider } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'polystirolhub_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Начинаем с null для одинакового рендера на сервере и клиенте
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshUser = useCallback(async () => {
		setIsLoading(true);
		try {
			const userData = await authService.getCurrentUser();
			setUser(userData);
			// Сохраняем в localStorage
			if (userData) {
				localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
			} else {
				localStorage.removeItem(USER_STORAGE_KEY);
			}
		} catch (error) {
			console.error('Failed to refresh user:', error);
			setUser(null);
			localStorage.removeItem(USER_STORAGE_KEY);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const login = useCallback(async (provider: OAuthProvider) => {
		await authService.initiateLogin(provider);
		// After redirect, user will be set by refreshUser on callback page
	}, []);

	const logout = useCallback(async () => {
		setIsLoading(true);
		try {
			await authService.logout();
			setUser(null);
			localStorage.removeItem(USER_STORAGE_KEY);
		} catch (error) {
			console.error('Logout error:', error);
			// Clear user state even if API call fails
			setUser(null);
			localStorage.removeItem(USER_STORAGE_KEY);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Загружаем из localStorage и затем обновляем с сервера
	useEffect(() => {
		// Загружаем из localStorage сразу после монтирования
		try {
			const stored = localStorage.getItem(USER_STORAGE_KEY);
			if (stored) {
				const parsedUser = JSON.parse(stored);
				setUser(parsedUser);
			}
		} catch {
			// Игнорируем ошибки парсинга
		}

		// Затем обновляем с сервера
		refreshUser();
	}, [refreshUser]);

	const value: AuthContextType = {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}
