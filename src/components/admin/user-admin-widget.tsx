'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { AdminApi, apiConfig } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserBadgeDisplay } from '@/components/badges/user-badge-display';

interface AdminUser {
	id: string;
	email: string | null;
	username: string;
	avatar: string | null;
	is_active: boolean;
	is_admin: boolean;
	is_super_admin: boolean;
	xp: number;
	level: number;
	selected_badge_id?: string | null;
	created_at: string;
}

export function UserAdminWidget() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [promoteModal, setPromoteModal] = useState<{ isOpen: boolean; user: AdminUser | null }>({
		isOpen: false,
		user: null,
	});
	const [demoteModal, setDemoteModal] = useState<{ isOpen: boolean; user: AdminUser | null }>({
		isOpen: false,
		user: null,
	});
	const [isProcessing, setIsProcessing] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [showResults, setShowResults] = useState(false);
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

	// Загрузка пользователей
	useEffect(() => {
		async function loadUsers() {
			try {
				setIsLoading(true);
				setError(null);
				const adminApi = new AdminApi(apiConfig);
				const response = await adminApi.getAllUsersApiV1AdminUsersGet();
				const usersList = Array.isArray(response) ? response : [];
				setUsers(usersList as AdminUser[]);
				setFilteredUsers(usersList as AdminUser[]);
			} catch (err) {
				console.error('Failed to load users:', err);
				setError('Не удалось загрузить пользователей');
			} finally {
				setIsLoading(false);
			}
		}

		loadUsers();
	}, []);

	// Фильтрация пользователей
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredUsers(users);
			setShowResults(false);
			setSelectedUser(null);
			return;
		}

		// Не показываем результаты, если пользователь уже выбран и поиск совпадает с его именем
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

	// Сбрасываем выбранного пользователя, если он больше не в результатах поиска
	useEffect(() => {
		if (selectedUser && searchQuery) {
			const isStillInResults = filteredUsers.some((u) => u.id === selectedUser.id);
			if (!isStillInResults) {
				setSelectedUser(null);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filteredUsers, searchQuery]);

	// Обработка назначения админа
	const handlePromote = async () => {
		if (!promoteModal.user) return;

		try {
			setIsProcessing(true);
			const adminApi = new AdminApi(apiConfig);
			await adminApi.promoteToAdminApiV1AdminPromoteUserIdPost({
				userId: promoteModal.user.id,
			});
			// Обновляем список пользователей
			const response = await adminApi.getAllUsersApiV1AdminUsersGet();
			const usersList = Array.isArray(response) ? response : [];
			setUsers(usersList as AdminUser[]);
			// Обновляем фильтрованный список
			const query = searchQuery.toLowerCase();
			if (!query) {
				setFilteredUsers(usersList as AdminUser[]);
			} else {
				const filtered = usersList.filter(
					(user: AdminUser) =>
						user.username.toLowerCase().includes(query) ||
						(user.email && user.email.toLowerCase().includes(query))
				);
				setFilteredUsers(filtered);
			}
			// Обновляем выбранного пользователя
			if (promoteModal.user) {
				const updatedUser = usersList.find((u: AdminUser) => u.id === promoteModal.user!.id);
				if (updatedUser) {
					setSelectedUser(updatedUser as AdminUser);
				}
			}
			setPromoteModal({ isOpen: false, user: null });
		} catch (err) {
			console.error('Failed to promote user:', err);
			setError('Не удалось назначить админа');
		} finally {
			setIsProcessing(false);
		}
	};

	// Обработка снятия админки
	const handleDemote = async () => {
		if (!demoteModal.user) return;

		try {
			setIsProcessing(true);
			const adminApi = new AdminApi(apiConfig);
			await adminApi.demoteFromAdminApiV1AdminDemoteUserIdPost({
				userId: demoteModal.user.id,
			});
			// Обновляем список пользователей
			const response = await adminApi.getAllUsersApiV1AdminUsersGet();
			const usersList = Array.isArray(response) ? response : [];
			setUsers(usersList as AdminUser[]);
			// Обновляем фильтрованный список
			const query = searchQuery.toLowerCase();
			if (!query) {
				setFilteredUsers(usersList as AdminUser[]);
			} else {
				const filtered = usersList.filter(
					(user: AdminUser) =>
						user.username.toLowerCase().includes(query) ||
						(user.email && user.email.toLowerCase().includes(query))
				);
				setFilteredUsers(filtered);
			}
			// Обновляем выбранного пользователя
			const demoteUser = demoteModal.user;
			if (demoteUser) {
				const updatedUser = usersList.find((u: AdminUser) => u.id === demoteUser.id);
				if (updatedUser) {
					setSelectedUser(updatedUser as AdminUser);
				}
			}
			setDemoteModal({ isOpen: false, user: null });
		} catch (err) {
			console.error('Failed to demote user:', err);
			setError('Не удалось снять админку');
		} finally {
			setIsProcessing(false);
		}
	};

	// Закрытие результатов при клике вне области
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

		if (showResults) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showResults]);

	// Проверка прав доступа (только super admin)
	if (!currentUser?.is_super_admin) {
		return null;
	}

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Управление админами</h3>

			{error && (
				<div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
					{error}
				</div>
			)}

			{/* Поле поиска */}
			<div className="relative mb-4">
				<Input
					ref={searchInputRef}
					type="text"
					placeholder="Поиск по имени пользователя или email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => {
						// Показываем результаты только если нет выбранного пользователя или поиск не совпадает с именем выбранного
						if (
							filteredUsers.length > 0 &&
							(!selectedUser || searchQuery !== selectedUser.username)
						) {
							setShowResults(true);
						}
					}}
					className="w-full bg-black/20 border-white/10 text-white placeholder:text-white/40"
				/>

				{/* Результаты поиска */}
				{showResults && filteredUsers.length > 0 && (
					<div
						ref={resultsRef}
						className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg"
					>
						{filteredUsers.map((user) => (
							<div
								key={user.id}
								className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
								onClick={() => {
									setSelectedUser(user);
									setSearchQuery(user.username);
									setShowResults(false);
								}}
							>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary shrink-0">
										{user.avatar ? (
											<Image
												src={user.avatar}
												alt={user.username}
												className="h-full w-full object-cover"
												width={40}
												height={40}
												unoptimized
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
												{user.username.substring(0, 2).toUpperCase()}
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-medium text-white truncate">{user.username}</span>
											{user.selected_badge_id && (
												<UserBadgeDisplay badgeId={user.selected_badge_id} size="sm" />
											)}
											{user.is_super_admin && (
												<span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
													Супер админ
												</span>
											)}
											{user.is_admin && !user.is_super_admin && (
												<span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
													Админ
												</span>
											)}
										</div>
										{user.email && <p className="text-xs text-white/60 truncate">{user.email}</p>}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Выбранный пользователь - показываем только после выбора из списка */}
			{selectedUser && (
				<div className="mb-4 rounded-lg bg-white/5 border border-white/10 p-2">
					<div className="flex items-start gap-2">
						<div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary shrink-0">
							{selectedUser.avatar ? (
								<Image
									src={selectedUser.avatar}
									alt={selectedUser.username}
									className="h-full w-full object-cover"
									width={40}
									height={40}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
									{selectedUser.username.substring(0, 2).toUpperCase()}
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5 mb-1 flex-wrap">
								<h3 className="text-xs font-bold text-white truncate">{selectedUser.username}</h3>
								{selectedUser.selected_badge_id && (
									<UserBadgeDisplay badgeId={selectedUser.selected_badge_id} size="sm" />
								)}
								{selectedUser.is_super_admin && (
									<span className="flex items-center gap-0.5 rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-400 shrink-0">
										Супер админ
									</span>
								)}
								{selectedUser.is_admin && !selectedUser.is_super_admin && (
									<span className="flex items-center gap-0.5 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400 shrink-0">
										Админ
									</span>
								)}
							</div>
							{selectedUser.email && (
								<p className="text-[10px] text-white/60 mb-1 truncate">{selectedUser.email}</p>
							)}
							<div className="flex items-center gap-2 text-[9px] text-white/40 flex-wrap">
								<span className="truncate">ID: {selectedUser.id.substring(0, 8)}...</span>
								<span>Уровень: {selectedUser.level}</span>
							</div>
						</div>
					</div>
					<div className="flex gap-2 mt-2">
						{!selectedUser.is_admin && !selectedUser.is_super_admin && (
							<Button
								onClick={() => setPromoteModal({ isOpen: true, user: selectedUser })}
								disabled={isProcessing}
								variant="default"
								size="sm"
								className="h-7 px-2 text-xs flex-1"
							>
								Назначить админом
							</Button>
						)}
						{selectedUser.is_admin && !selectedUser.is_super_admin && (
							<Button
								onClick={() => setDemoteModal({ isOpen: true, user: selectedUser })}
								disabled={isProcessing}
								variant="destructive"
								size="sm"
								className="h-7 px-2 text-xs flex-1"
							>
								Снять админку
							</Button>
						)}
						{selectedUser.is_super_admin && (
							<span className="text-[10px] text-white/40 text-center py-1">
								Нельзя изменить статус супер админа
							</span>
						)}
					</div>
				</div>
			)}

			{/* Сообщение, если поиск не дал результатов */}
			{searchQuery && filteredUsers.length === 0 && !isLoading && (
				<p className="text-center text-white/60 py-8">Пользователи не найдены</p>
			)}

			{isLoading && (
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			)}

			{/* Модальные окна подтверждения */}
			{promoteModal.isOpen && promoteModal.user && (
				<ConfirmationModal
					isOpen={promoteModal.isOpen}
					onClose={() => setPromoteModal({ isOpen: false, user: null })}
					onConfirm={handlePromote}
					title="Назначить админом"
					message={`Вы уверены, что хотите назначить пользователя "${promoteModal.user.username}" админом?`}
					confirmText="Назначить"
					cancelText="Отмена"
					isDangerous={false}
				/>
			)}

			{demoteModal.isOpen && demoteModal.user && (
				<ConfirmationModal
					isOpen={demoteModal.isOpen}
					onClose={() => setDemoteModal({ isOpen: false, user: null })}
					onConfirm={handleDemote}
					title="Снять админку"
					message={`Вы уверены, что хотите снять админку у пользователя "${demoteModal.user.username}"?`}
					confirmText="Снять"
					cancelText="Отмена"
					isDangerous={true}
				/>
			)}
		</div>
	);
}
