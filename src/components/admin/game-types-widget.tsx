'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { gameService } from '@/lib/game/game-service';
import type { GameTypeResponse } from '@/lib/api/generated';

// Иконки для кнопок
const EditIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>
);

const SaveIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
		<polyline points="17 21 17 13 7 13 7 21" />
		<polyline points="7 3 7 8 15 8" />
	</svg>
);

const XIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const TrashIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);

export function GameTypesWidget() {
	const [gameTypes, setGameTypes] = useState<GameTypeResponse[]>([]);
	const [newGameType, setNewGameType] = useState('');
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: GameTypeResponse | null;
	}>({
		isOpen: false,
		type: null,
	});
	const [editingType, setEditingType] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Загрузка типов игр из API
	useEffect(() => {
		async function loadGameTypes() {
			try {
				setIsLoading(true);
				setError(null);
				const types = await gameService.getAdminGameTypes();
				setGameTypes(types);
			} catch (err) {
				console.error('Failed to load game types:', err);
				setError(err instanceof Error ? err.message : 'Не удалось загрузить типы игр');
			} finally {
				setIsLoading(false);
			}
		}

		loadGameTypes();
	}, []);

	const handleAdd = async () => {
		const trimmed = newGameType.trim();
		if (!trimmed) {
			setError('Введите название типа игры');
			return;
		}

		if (gameTypes.some((type) => type.name === trimmed)) {
			setError('Такой тип игры уже существует');
			return;
		}

		try {
			setIsProcessing(true);
			setError(null);
			setSuccess(null);
			const newType = await gameService.createGameType(trimmed);
			setGameTypes([...gameTypes, newType]);
			setNewGameType('');
			setSuccess('Тип игры успешно добавлен');
		} catch (err) {
			console.error('Failed to add game type:', err);
			setError(err instanceof Error ? err.message : 'Не удалось добавить тип игры');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteModal.type || !deleteModal.type.id) return;

		try {
			setIsProcessing(true);
			setError(null);
			setSuccess(null);
			await gameService.deleteGameType(deleteModal.type.id);
			setGameTypes(gameTypes.filter((type) => type.id !== deleteModal.type?.id));
			setDeleteModal({ isOpen: false, type: null });
			setSuccess('Тип игры успешно удален');
		} catch (err) {
			console.error('Failed to delete game type:', err);
			setError(err instanceof Error ? err.message : 'Не удалось удалить тип игры');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleStartEdit = (type: GameTypeResponse) => {
		// Получаем имя типа (может быть строкой или объектом)
		let typeName = '';
		if (typeof type.name === 'string') {
			typeName = type.name;
		} else if (typeof type.name === 'object' && type.name !== null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for (const key in type.name as any) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const val = (type.name as any)[key];
				if (typeof val === 'string' && val.trim()) {
					typeName = val;
					break;
				}
			}
		}

		if (type.id) {
			let typeId = '';
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
				setEditingType({ id: typeId, name: typeName });
				setError(null);
				setSuccess(null);
			}
		}
	};

	const handleCancelEdit = () => {
		setEditingType(null);
		setError(null);
	};

	const handleSaveEdit = async () => {
		if (!editingType) return;

		const trimmed = editingType.name.trim();
		if (!trimmed) {
			setError('Введите название типа игры');
			return;
		}

		// Проверяем, что новое название не совпадает с другими типами
		if (
			gameTypes.some((type) => {
				let typeName = '';
				if (typeof type.name === 'string') {
					typeName = type.name;
				} else if (typeof type.name === 'object' && type.name !== null) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					for (const key in type.name as any) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const val = (type.name as any)[key];
						if (typeof val === 'string' && val.trim()) {
							typeName = val;
							break;
						}
					}
				}

				let typeId = '';
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

				return typeName === trimmed && typeId !== editingType.id;
			})
		) {
			setError('Такой тип игры уже существует');
			return;
		}

		try {
			setIsProcessing(true);
			setError(null);
			setSuccess(null);
			const updatedType = await gameService.updateGameType(editingType.id, trimmed);
			setGameTypes(
				gameTypes.map((type) => {
					let typeId = '';
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
					return typeId === editingType.id ? updatedType : type;
				})
			);
			setEditingType(null);
			setSuccess('Тип игры успешно обновлен');
		} catch (err) {
			console.error('Failed to update game type:', err);
			setError(err instanceof Error ? err.message : 'Не удалось обновить тип игры');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSaveEdit();
		} else if (e.key === 'Escape') {
			handleCancelEdit();
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleAdd();
		}
	};

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-3 text-sm font-bold text-white">Управление типами игр</h3>

			{error && (
				<div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-3 rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-xs text-green-400">
					{success}
				</div>
			)}

			{/* Добавление нового типа игры */}
			<div className="mb-4 flex gap-2">
				<Input
					type="text"
					placeholder="Введите название типа игры..."
					value={newGameType}
					onChange={(e) => {
						setNewGameType(e.target.value);
						setError(null);
						setSuccess(null);
					}}
					onKeyPress={handleKeyPress}
					disabled={isProcessing}
					className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40"
				/>
				<Button
					onClick={handleAdd}
					disabled={isProcessing || !newGameType.trim()}
					variant="default"
					size="default"
				>
					Добавить
				</Button>
			</div>

			{/* Список типов игр */}
			<div className="space-y-2">
				{isLoading ? (
					<div className="flex items-center justify-center py-4">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
					</div>
				) : gameTypes.length === 0 ? (
					<p className="text-center text-xs text-white/60 py-3">Нет типов игр</p>
				) : (
					gameTypes.map((type) => {
						// Получаем ID и имя типа
						let typeId = '';
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

						let typeName = '';
						if (typeof type.name === 'string') {
							typeName = type.name;
						} else if (typeof type.name === 'object' && type.name !== null) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							for (const key in type.name as any) {
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								const val = (type.name as any)[key];
								if (typeof val === 'string' && val.trim()) {
									typeName = val;
									break;
								}
							}
						}

						const isEditing = editingType?.id === typeId;

						return (
							<div
								key={typeId || type.id}
								className="flex items-center justify-between rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors"
							>
								{isEditing ? (
									<div className="flex items-center gap-2 flex-1 mr-2">
										<Input
											type="text"
											value={editingType.name}
											onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
											onKeyPress={handleEditKeyPress}
											disabled={isProcessing}
											className="flex-1 h-7 bg-black/20 border-white/10 text-white text-xs"
											autoFocus
										/>
										<Button
											onClick={handleSaveEdit}
											disabled={isProcessing}
											variant="default"
											size="sm"
											className="h-7 w-7 p-0"
											title="Сохранить"
										>
											<SaveIcon />
										</Button>
										<Button
											onClick={handleCancelEdit}
											disabled={isProcessing}
											variant="secondary"
											size="sm"
											className="h-7 w-7 p-0"
											title="Отмена"
										>
											<XIcon />
										</Button>
									</div>
								) : (
									<>
										<span className="text-xs font-medium text-white flex-1">{typeName}</span>
										<div className="flex gap-2">
											<Button
												onClick={() => handleStartEdit(type)}
												disabled={isProcessing}
												variant="secondary"
												size="sm"
												className="h-7 w-7 p-0"
												title="Редактировать"
											>
												<EditIcon />
											</Button>
											<Button
												onClick={() => setDeleteModal({ isOpen: true, type })}
												disabled={isProcessing}
												variant="destructive"
												size="sm"
												className="h-7 w-7 p-0"
												title="Удалить"
											>
												<TrashIcon />
											</Button>
										</div>
									</>
								)}
							</div>
						);
					})
				)}
			</div>

			{/* Модальное окно подтверждения удаления */}
			{deleteModal.isOpen && deleteModal.type && (
				<ConfirmationModal
					isOpen={deleteModal.isOpen}
					onClose={() => setDeleteModal({ isOpen: false, type: null })}
					onConfirm={handleDelete}
					title="Удалить тип игры"
					message={`Вы уверены, что хотите удалить тип игры "${deleteModal.type.name}"?`}
					confirmText="Удалить"
					cancelText="Отмена"
					isDangerous={true}
				/>
			)}
		</div>
	);
}
