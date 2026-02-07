'use client';

/**
 * Badge Revoke Modal
 *
 * Modal for revoking badges from users
 */

import { useState, useEffect, useRef } from 'react';
import { badgeService } from '@/lib/badges/badge-service';
import { apiConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Badge } from '@/lib/api/generated';

interface AdminUser {
	id: string;
	username: string;
	email: string | null;
}

interface BadgeRevokeModalProps {
	badge: Badge;
	onSuccess: () => void;
	onCancel: () => void;
}

export function BadgeRevokeModal({ badge, onSuccess, onCancel }: BadgeRevokeModalProps) {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
	const [showResults, setShowResults] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoadingUsers, setIsLoadingUsers] = useState(true);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	// Load users
	useEffect(() => {
		async function loadUsers() {
			try {
				setIsLoadingUsers(true);
				const basePath = apiConfig.basePath || 'http://localhost:8000';
				const params = new URLSearchParams();
				params.append('skip', '0');
				params.append('limit', '100');
				const url = `${basePath}/api/v1/admin/users?${params.toString()}`;

				const response = await fetch(url, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error('Не удалось загрузить пользователей');
				}

				const usersList = await response.json();
				const usersArray = Array.isArray(usersList) ? usersList : [];
				setUsers(usersArray as AdminUser[]);
				setFilteredUsers(usersArray as AdminUser[]);
			} catch (err) {
				console.error('Failed to load users:', err);
				setError('Не удалось загрузить пользователей');
			} finally {
				setIsLoadingUsers(false);
			}
		}

		loadUsers();
	}, []);

	// Filter users
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredUsers(users);
			setShowResults(false);
			return;
		}

		if (selectedUser && searchQuery.trim() === selectedUser.username) {
			setShowResults(false);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = users.filter(
			(user) =>
				user.username.toLowerCase().includes(query) ||
				(user.email && user.email.toLowerCase().includes(query))
		);
		setFilteredUsers(filtered);
		setShowResults(true);
	}, [searchQuery, users, selectedUser]);

	// Close results when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				resultsRef.current &&
				!resultsRef.current.contains(event.target as Node) &&
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node)
			) {
				setShowResults(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleUserSelect = (user: AdminUser) => {
		setSelectedUser(user);
		setSearchQuery(user.username);
		setShowResults(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!selectedUser) {
			setError('Выберите пользователя');
			return;
		}

		try {
			setIsSubmitting(true);
			await badgeService.revokeBadge(badge.id || '', selectedUser.id);
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to revoke badge:', err);
			setError(err instanceof Error ? err.message : 'Не удалось отозвать бэйджик');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className="glass-card bg-[var(--color-secondary)] relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				<h2 className="mb-4 text-2xl font-bold text-white">Отозвать бэйджик</h2>
				<p className="text-sm text-white/60 mb-6">
					Отзыв бэйджа: <span className="font-medium text-white">{badge.name}</span>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* User Search */}
					<div className="relative">
						<label className="block text-sm font-medium text-white/90 mb-2">
							Пользователь <span className="text-red-400">*</span>
						</label>
						<Input
							ref={searchInputRef}
							type="text"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setSelectedUser(null);
							}}
							placeholder="Поиск по имени или email..."
							required
						/>
						{showResults && filteredUsers.length > 0 && (
							<div
								ref={resultsRef}
								className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-[var(--color-secondary)] border border-white/10 shadow-lg"
							>
								{filteredUsers.map((user) => (
									<button
										key={user.id}
										type="button"
										onClick={() => handleUserSelect(user)}
										className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
									>
										<div className="font-medium text-white">{user.username}</div>
										{user.email && <div className="text-xs text-white/60">{user.email}</div>}
									</button>
								))}
							</div>
						)}
						{isLoadingUsers && (
							<div className="absolute right-3 top-9">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
							</div>
						)}
					</div>

					{/* Error */}
					{error && (
						<div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-400">
							{error}
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-3 justify-end pt-4">
						<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
							Отмена
						</Button>
						<Button type="submit" variant="destructive" disabled={isSubmitting || !selectedUser}>
							{isSubmitting ? 'Отзыв...' : 'Отозвать'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
