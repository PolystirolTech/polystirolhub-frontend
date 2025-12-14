'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { gameService } from '@/lib/game/game-service';
import type { GameTypeResponse, GameServerResponse, ServerStatus } from '@/lib/api/generated';

interface ServerEditModalProps {
	server: GameServerResponse;
	isOpen: boolean;
	onClose: () => void;
	onServerUpdated: (server: GameServerResponse) => void;
}

export function ServerEditModal({
	server,
	isOpen,
	onClose,
	onServerUpdated,
}: ServerEditModalProps) {
	const [gameTypes, setGameTypes] = useState<GameTypeResponse[]>([]);
	const [formData, setFormData] = useState({
		gameTypeId: server.gameTypeId || '',
		name: server.name || '',
		description: typeof server.description === 'string' ? server.description : '',
		mods: Array.isArray(server.mods) ? server.mods : [],
		banner: null as File | null,
		ip: server.ip || '',
		port: ('port' in server && typeof server.port === 'string' ? server.port : '') || '',
		serverStatus: (server.status as ServerStatus) || ('active' as ServerStatus),
	});
	const [modName, setModName] = useState('');
	const [modUrl, setModUrl] = useState('');
	const [bannerPreview, setBannerPreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Инициализация данных при открытии модального окна
	useEffect(() => {
		if (isOpen) {
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
			const getBannerUrl = (bannerUrl: any): string | null => {
				if (!bannerUrl) return null;
				if (typeof bannerUrl === 'string') return bannerUrl;
				if (typeof bannerUrl === 'object' && 'bannerUrl' in bannerUrl) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return (bannerUrl as any).bannerUrl || null;
				}
				return null;
			};

			setFormData({
				gameTypeId: server.gameTypeId || '',
				name: server.name || '',
				description: getDescription(server.description),
				mods: getModsArray(server.mods),
				banner: null,
				ip: server.ip || '',
				port: ('port' in server && typeof server.port === 'string' ? server.port : '') || '',
				serverStatus: (server.status as ServerStatus) || ('active' as ServerStatus),
			});
			setModName('');
			setModUrl('');
			setBannerPreview(getBannerUrl(server.bannerUrl));
			setMessage(null);
		}
	}, [isOpen, server]);

	// Загрузка типов игр
	useEffect(() => {
		async function loadGameTypes() {
			try {
				setIsLoading(true);
				const types = await gameService.getAdminGameTypes();
				setGameTypes(types);
			} catch (err) {
				console.error('Failed to load game types:', err);
				setMessage({
					type: 'error',
					text: err instanceof Error ? err.message : 'Не удалось загрузить типы игр',
				});
			} finally {
				setIsLoading(false);
			}
		}

		if (isOpen) {
			loadGameTypes();
		}
	}, [isOpen]);

	// Закрытие на Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// Блокировка скролла body
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

	const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				setMessage({ type: 'error', text: 'Выберите файл изображения' });
				return;
			}
			const url = URL.createObjectURL(file);
			setBannerPreview(url);
			setFormData((prev) => ({ ...prev, banner: file }));
		}
	};

	const handleAddMod = () => {
		const trimmedName = modName.trim();
		const trimmedUrl = modUrl.trim();

		if (!trimmedName) {
			setMessage({ type: 'error', text: 'Введите название мода' });
			return;
		}

		if (!trimmedUrl) {
			setMessage({ type: 'error', text: 'Введите ссылку на мод' });
			return;
		}

		try {
			new URL(trimmedUrl);
		} catch {
			setMessage({ type: 'error', text: 'Введите корректную ссылку' });
			return;
		}

		const modString = `${trimmedName}: ${trimmedUrl}`;
		if (formData.mods.includes(modString)) {
			setMessage({ type: 'error', text: 'Этот мод уже добавлен' });
			return;
		}

		setFormData((prev) => ({ ...prev, mods: [...prev.mods, modString] }));
		setModName('');
		setModUrl('');
		setMessage(null);
	};

	const handleRemoveMod = (index: number) => {
		setFormData((prev) => ({
			...prev,
			mods: prev.mods.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setMessage(null);

		if (!formData.gameTypeId) {
			setMessage({ type: 'error', text: 'Выберите тип игры' });
			setIsSubmitting(false);
			return;
		}

		if (!formData.name.trim()) {
			setMessage({ type: 'error', text: 'Введите название сервера' });
			setIsSubmitting(false);
			return;
		}

		if (!formData.description.trim()) {
			setMessage({ type: 'error', text: 'Введите описание сервера' });
			setIsSubmitting(false);
			return;
		}

		if (!formData.ip.trim()) {
			setMessage({ type: 'error', text: 'Введите IP адрес сервера' });
			setIsSubmitting(false);
			return;
		}

		if (!server.id) {
			setMessage({ type: 'error', text: 'Ошибка: ID сервера не найден' });
			setIsSubmitting(false);
			return;
		}

		try {
			const updatedServer = await gameService.updateGameServer(server.id, {
				name: formData.name.trim(),
				gameTypeId: formData.gameTypeId,
				description: formData.description.trim(),
				mods: formData.mods,
				ip: formData.ip.trim(),
				port: formData.port?.trim() || undefined,
				banner: formData.banner,
				serverStatus: formData.serverStatus,
			});
			onServerUpdated(updatedServer);
			setMessage({ type: 'success', text: 'Сервер успешно обновлен!' });
			setTimeout(() => {
				onClose();
			}, 1000);
		} catch (error: unknown) {
			console.error('Failed to update server:', error);
			const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении сервера';
			setMessage({ type: 'error', text: errorMessage });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleModKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddMod();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="glass-card bg-[var(--color-secondary)] relative max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				<h2 className="mb-4 text-sm font-bold text-white">Редактирование сервера</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Тип игры */}
					<div className="space-y-1.5">
						<label htmlFor="edit-gameType" className="text-xs font-medium text-white">
							Тип игры *
						</label>
						<select
							id="edit-gameType"
							value={formData.gameTypeId}
							onChange={(e) => setFormData((prev) => ({ ...prev, gameTypeId: e.target.value }))}
							disabled={isLoading}
							className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="">{isLoading ? 'Загрузка...' : 'Выберите тип игры'}</option>
							{gameTypes.map((type) => (
								<option key={type.id} value={type.id || ''}>
									{type.name}
								</option>
							))}
						</select>
					</div>

					{/* Название */}
					<div className="space-y-1.5">
						<label htmlFor="edit-name" className="text-xs font-medium text-white">
							Название *
						</label>
						<Input
							id="edit-name"
							type="text"
							value={formData.name}
							onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							placeholder="Введите название сервера"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
					</div>

					{/* Описание */}
					<div className="space-y-1.5">
						<label htmlFor="edit-description" className="text-xs font-medium text-white">
							Описание *
						</label>
						<textarea
							id="edit-description"
							value={formData.description}
							onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
							placeholder="Введите описание сервера"
							rows={3}
							className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm resize-none"
						/>
					</div>

					{/* Список модов */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-white">Список модов</label>
						<div className="flex gap-2 mb-2">
							<Input
								type="text"
								value={modName}
								onChange={(e) => {
									setModName(e.target.value);
									setMessage(null);
								}}
								onKeyPress={handleModKeyPress}
								placeholder="Название мода..."
								className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
							/>
							<Input
								type="url"
								value={modUrl}
								onChange={(e) => {
									setModUrl(e.target.value);
									setMessage(null);
								}}
								onKeyPress={handleModKeyPress}
								placeholder="URL мода..."
								className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
							/>
							<Button type="button" onClick={handleAddMod} variant="secondary" size="default">
								Добавить
							</Button>
						</div>
						{formData.mods.length > 0 && (
							<div className="space-y-2">
								{formData.mods.map((mod, index) => {
									const [name, url] = mod.split(': ').map((s: string) => s.trim());
									return (
										<div
											key={index}
											className="flex items-center justify-between rounded-lg bg-white/5 p-2"
										>
											<a
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-primary hover:underline truncate flex-1 mr-2"
											>
												{name}
											</a>
											<Button
												type="button"
												onClick={() => handleRemoveMod(index)}
												variant="destructive"
												size="sm"
												className="h-7 px-2 text-xs"
											>
												Удалить
											</Button>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Баннер */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-white">Баннер</label>
						<div className="flex items-center gap-4">
							{bannerPreview && (
								<div className="relative h-24 w-36 overflow-hidden rounded-lg border-2 border-primary/50 shrink-0">
									<Image
										src={bannerPreview}
										alt="Banner preview"
										className="h-full w-full object-cover"
										width={144}
										height={96}
										unoptimized
									/>
								</div>
							)}
							<div className="flex-1">
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									className="bg-white/10 hover:bg-white/20 text-white border-0"
								>
									{bannerPreview ? 'Изменить баннер' : 'Загрузить баннер'}
								</Button>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleBannerChange}
									accept="image/*"
									className="hidden"
								/>
								<p className="text-xs text-white/60 mt-1">Форматы: JPG, PNG. Макс. размер: 10MB</p>
							</div>
						</div>
					</div>

					{/* IP */}
					<div className="space-y-1.5">
						<label htmlFor="edit-ip" className="text-xs font-medium text-white">
							IP адрес *
						</label>
						<Input
							id="edit-ip"
							type="text"
							value={formData.ip}
							onChange={(e) => setFormData((prev) => ({ ...prev, ip: e.target.value }))}
							placeholder="192.168.1.1:25565"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
					</div>

					{/* Port */}
					<div className="space-y-1.5">
						<label htmlFor="edit-port" className="text-xs font-medium text-white">
							Порт
						</label>
						<Input
							id="edit-port"
							type="text"
							value={formData.port || ''}
							onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
							placeholder="25565"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
					</div>

					{/* Статус сервера */}
					<div className="space-y-1.5">
						<label htmlFor="edit-serverStatus" className="text-xs font-medium text-white">
							Статус сервера
						</label>
						<select
							id="edit-serverStatus"
							value={formData.serverStatus as string}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, serverStatus: e.target.value as ServerStatus }))
							}
							className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="active">Работает</option>
							<option value="disabled">Выключен</option>
							<option value="maintenance">На обслуживании</option>
						</select>
					</div>

					{/* Сообщения */}
					{message && (
						<div
							className={cn(
								'p-2 rounded-lg text-xs border',
								message.type === 'success'
									? 'bg-green-500/10 border-green-500/20 text-green-400'
									: 'bg-red-500/10 border-red-500/20 text-red-400'
							)}
						>
							{message.text}
						</div>
					)}

					{/* Кнопки */}
					<div className="flex justify-end gap-2 pt-2">
						<Button type="button" onClick={onClose} variant="secondary" className="text-sm">
							Отмена
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-primary hover:bg-primary/90 text-white font-medium px-6 text-sm"
						>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
