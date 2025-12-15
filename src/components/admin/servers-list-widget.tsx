'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { gameService } from '@/lib/game/game-service';
import type { GameServerResponse } from '@/lib/api/generated';
import { ServerEditModal } from './server-edit-modal';

export function ServersListWidget() {
	const [servers, setServers] = useState<GameServerResponse[]>([]);
	const [gameTypes, setGameTypes] = useState<Map<string, string>>(new Map()); // Map<gameTypeId, gameTypeName>
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		server: GameServerResponse | null;
	}>({
		isOpen: false,
		server: null,
	});
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		server: GameServerResponse | null;
	}>({
		isOpen: false,
		server: null,
	});
	const [isProcessing, setIsProcessing] = useState(false);

	const loadGameTypes = async () => {
		try {
			const types = await gameService.getAdminGameTypes();
			const typesMap = new Map<string, string>();
			types.forEach((type) => {
				// Обработка id (может быть строкой или объектом)
				let typeId: string | null = null;
				if (typeof type.id === 'string') {
					typeId = type.id;
				} else if (typeof type.id === 'object' && type.id !== null) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					for (const key in type.id as any) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const val = (type.id as any)[key];
						if (typeof val === 'string' && val.trim()) {
							typeId = val;
							break;
						}
					}
				}

				if (typeId) {
					// Обработка name (может быть строкой или объектом)
					let name = 'Неизвестный тип';
					if (typeof type.name === 'string') {
						name = type.name;
					} else if (typeof type.name === 'object' && type.name !== null) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						for (const key in type.name as any) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const val = (type.name as any)[key];
							if (typeof val === 'string' && val.trim()) {
								name = val;
								break;
							}
						}
					}
					typesMap.set(typeId, name);
				}
			});
			setGameTypes(typesMap);
		} catch (err) {
			console.error('Failed to load game types:', err);
		}
	};

	const loadServers = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			// Загружаем типы игр и серверы параллельно
			await Promise.all([loadGameTypes(), gameService.getAdminGameServers()]).then(
				([, serversList]) => {
					setServers(serversList);
				}
			);
		} catch (err) {
			console.error('Failed to load servers:', err);
			setError(err instanceof Error ? err.message : 'Не удалось загрузить серверы');
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Загрузка серверов при монтировании
	useEffect(() => {
		loadServers();
	}, [loadServers]);

	// Слушаем событие обновления списка серверов
	useEffect(() => {
		const handleServerCreated = () => {
			loadServers();
		};

		window.addEventListener('server-created', handleServerCreated);
		return () => {
			window.removeEventListener('server-created', handleServerCreated);
		};
	}, [loadServers]);

	const handleDelete = async () => {
		if (!deleteModal.server || !deleteModal.server.id) return;

		try {
			setIsProcessing(true);
			await gameService.deleteGameServer(deleteModal.server.id);
			setServers(servers.filter((s) => s.id !== deleteModal.server?.id));
			setDeleteModal({ isOpen: false, server: null });
		} catch (err) {
			console.error('Failed to delete server:', err);
			alert(err instanceof Error ? err.message : 'Не удалось удалить сервер');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleServerUpdated = (updatedServer: GameServerResponse) => {
		setServers(servers.map((s) => (s.id === updatedServer.id ? updatedServer : s)));
		setEditModal({ isOpen: false, server: null });
	};

	if (isLoading) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<h3 className="mb-3 text-sm font-bold text-white">Управление серверами</h3>
				<div className="flex items-center justify-center py-8">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-sm font-bold text-white">Управление серверами</h3>
					<Button
						onClick={loadServers}
						variant="secondary"
						size="sm"
						className="h-7 px-2 text-xs"
						disabled={isLoading}
					>
						Обновить
					</Button>
				</div>

				{error && (
					<div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
						{error}
					</div>
				)}

				{servers.length === 0 ? (
					<p className="text-center text-xs text-white/60 py-4">Нет серверов</p>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{servers.map((server) => {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const getBannerUrl = (bannerUrl: any): string | null => {
								if (!bannerUrl) return null;
								if (typeof bannerUrl === 'string') return bannerUrl;
								if (typeof bannerUrl === 'object' && 'bannerUrl' in bannerUrl) {
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									return (bannerUrl as any).bannerUrl || null;
								}
								return null;
							};

							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const getModsArray = (mods: any): string[] => {
								if (!mods) return [];
								if (Array.isArray(mods)) return mods;
								if (typeof mods === 'string') {
									try {
										return JSON.parse(mods);
									} catch {
										return [];
									}
								}
								return [];
							};

							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const getDescription = (desc: any): string => {
								if (typeof desc === 'string') return desc;
								if (typeof desc === 'object' && desc && 'description' in desc) {
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									return (desc as any).description || '';
								}
								return '';
							};

							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const getGameTypeName = (gameType: any, gameTypeId: any): string => {
								// Сначала пытаемся получить из объекта gameType
								if (gameType && typeof gameType === 'object') {
									// Проверяем поле name напрямую
									if ('name' in gameType) {
										const nameValue = gameType.name;
										// Если name - строка
										if (typeof nameValue === 'string' && nameValue.trim()) {
											return nameValue;
										}
										// Если name - объект (обертка)
										if (typeof nameValue === 'object' && nameValue !== null) {
											// Ищем строку в объекте
											for (const key in nameValue) {
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												const val = (nameValue as any)[key];
												if (typeof val === 'string' && val.trim()) {
													return val;
												}
											}
										}
									}
									// Если в объекте есть другие поля, которые могут быть именем
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									const gameTypeAny = gameType as any;
									for (const key in gameTypeAny) {
										const val = gameTypeAny[key];
										if (key === 'name' && typeof val === 'string' && val.trim()) {
											return val;
										}
									}
								}
								// Если gameType - строка
								if (typeof gameType === 'string' && gameType.trim()) {
									return gameType;
								}
								// Если gameType отсутствует, но есть gameTypeId - ищем в загруженных типах
								// Обрабатываем gameTypeId - может быть строкой или объектом
								let typeIdStr: string | null = null;
								if (gameTypeId) {
									if (typeof gameTypeId === 'string') {
										typeIdStr = gameTypeId;
									} else if (typeof gameTypeId === 'object' && gameTypeId !== null) {
										// Попробуем найти строку в объекте
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										for (const key in gameTypeId as any) {
											// eslint-disable-next-line @typescript-eslint/no-explicit-any
											const val = (gameTypeId as any)[key];
											if (typeof val === 'string' && val.trim()) {
												typeIdStr = val;
												break;
											}
										}
									}
								}

								if (typeIdStr) {
									const typeName = gameTypes.get(typeIdStr);
									if (typeName) {
										return typeName;
									}
								}
								return 'Неизвестный тип';
							};

							const bannerUrl = getBannerUrl(server.bannerUrl);
							const mods = getModsArray(server.mods);
							const description = getDescription(server.description);
							// Передаем и gameType, и gameTypeId для лучшей обработки
							const gameTypeName = getGameTypeName(server.gameType, server.gameTypeId);

							return (
								<div
									key={server.id}
									className="rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors"
								>
									{/* Баннер */}
									{bannerUrl && (
										<div className="relative h-24 w-full mb-2 overflow-hidden rounded-lg">
											<Image
												src={bannerUrl}
												alt={server.name || 'Server banner'}
												className="h-full w-full object-cover"
												width={200}
												height={96}
												unoptimized
											/>
										</div>
									)}

									{/* Название и тип игры */}
									<div className="mb-2">
										<h4 className="text-xs font-bold text-white truncate mb-1">
											{server.name || 'Без названия'}
										</h4>
										<p className="text-[10px] text-white/60">{gameTypeName}</p>
									</div>

									{/* Описание */}
									{description && (
										<p className="text-[10px] text-white/50 mb-2 line-clamp-2">{description}</p>
									)}

									{/* IP */}
									{server.ip && (
										<p className="text-[10px] text-white/40 mb-2 truncate">IP: {server.ip}</p>
									)}

									{/* Моды */}
									{mods.length > 0 && (
										<p className="text-[10px] text-white/40 mb-2">Модов: {mods.length}</p>
									)}

									{/* Кнопки */}
									<div className="flex gap-2 mt-3">
										<Button
											onClick={() => setEditModal({ isOpen: true, server })}
											variant="default"
											size="sm"
											className="flex-1 h-7 px-2 text-xs"
										>
											Редактировать
										</Button>
										<Button
											onClick={() => setDeleteModal({ isOpen: true, server })}
											variant="destructive"
											size="sm"
											disabled={isProcessing}
											className="h-7 px-2 text-xs"
										>
											Удалить
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Модальное окно редактирования */}
			{editModal.isOpen && editModal.server && (
				<ServerEditModal
					server={editModal.server}
					isOpen={editModal.isOpen}
					onClose={() => setEditModal({ isOpen: false, server: null })}
					onServerUpdated={handleServerUpdated}
				/>
			)}

			{/* Модальное окно удаления */}
			{deleteModal.isOpen && deleteModal.server && (
				<ConfirmationModal
					isOpen={deleteModal.isOpen}
					onClose={() => setDeleteModal({ isOpen: false, server: null })}
					onConfirm={handleDelete}
					title="Удалить сервер"
					message={`Вы уверены, что хотите удалить сервер "${deleteModal.server.name || 'Без названия'}"?`}
					confirmText="Удалить"
					cancelText="Отмена"
					isDangerous={true}
				/>
			)}
		</>
	);
}
