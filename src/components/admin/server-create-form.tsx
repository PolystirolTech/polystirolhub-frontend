'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { gameService } from '@/lib/game/game-service';
import type { GameTypeResponse } from '@/lib/api/generated';

interface ServerFormData {
	gameTypeId: string;
	name: string;
	description: string;
	mods: string[];
	banner: File | null;
	ip: string;
}

export function ServerCreateForm() {
	const [gameTypes, setGameTypes] = useState<GameTypeResponse[]>([]);
	const [formData, setFormData] = useState<ServerFormData>({
		gameTypeId: '',
		name: '',
		description: '',
		mods: [],
		banner: null,
		ip: '',
	});
	const [modUrl, setModUrl] = useState('');
	const [bannerPreview, setBannerPreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Загрузка типов игр из API
	useEffect(() => {
		async function loadGameTypes() {
			try {
				setIsLoading(true);
				const types = await gameService.getAdminGameTypes();
				setGameTypes(types);
				if (types.length > 0 && types[0].id) {
					setFormData((prev) => ({ ...prev, gameTypeId: types[0].id }));
				}
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

		loadGameTypes();
	}, []);

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
		const trimmed = modUrl.trim();
		if (!trimmed) {
			setMessage({ type: 'error', text: 'Введите ссылку на мод' });
			return;
		}

		// Простая валидация URL
		try {
			new URL(trimmed);
		} catch {
			setMessage({ type: 'error', text: 'Введите корректную ссылку' });
			return;
		}

		if (formData.mods.includes(trimmed)) {
			setMessage({ type: 'error', text: 'Эта ссылка уже добавлена' });
			return;
		}

		setFormData((prev) => ({ ...prev, mods: [...prev.mods, trimmed] }));
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

		// Валидация
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

		try {
			await gameService.createGameServer({
				name: formData.name.trim(),
				gameTypeId: formData.gameTypeId,
				description: formData.description.trim(),
				mods: formData.mods,
				ip: formData.ip.trim(),
				banner: formData.banner,
			});
			setMessage({ type: 'success', text: 'Сервер успешно создан!' });
			// Отправляем событие для обновления списка серверов
			window.dispatchEvent(new Event('server-created'));
			// Сброс формы
			setFormData({
				gameTypeId: gameTypes[0]?.id || '',
				name: '',
				description: '',
				mods: [],
				banner: null,
				ip: '',
			});
			setModUrl('');
			setBannerPreview(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		} catch (error: unknown) {
			console.error('Failed to create server:', error);
			const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании сервера';
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

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg">
			<h3 className="mb-4 text-sm font-bold text-white">Создание сервера</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Тип игры */}
				<div className="space-y-1.5">
					<label htmlFor="gameType" className="text-xs font-medium text-white">
						Тип игры *
					</label>
					<select
						id="gameType"
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
					<label htmlFor="name" className="text-xs font-medium text-white">
						Название *
					</label>
					<Input
						id="name"
						type="text"
						value={formData.name}
						onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
						placeholder="Введите название сервера"
						className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
					/>
				</div>

				{/* Описание */}
				<div className="space-y-1.5">
					<label htmlFor="description" className="text-xs font-medium text-white">
						Описание *
					</label>
					<textarea
						id="description"
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
							type="url"
							value={modUrl}
							onChange={(e) => {
								setModUrl(e.target.value);
								setMessage(null);
							}}
							onKeyPress={handleModKeyPress}
							placeholder="Введите ссылку на мод..."
							className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
						<Button type="button" onClick={handleAddMod} variant="secondary" size="default">
							Добавить
						</Button>
					</div>
					{formData.mods.length > 0 && (
						<div className="space-y-2">
							{formData.mods.map((mod, index) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-lg bg-white/5 p-2"
								>
									<a
										href={mod}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-primary hover:underline truncate flex-1 mr-2"
									>
										{mod}
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
							))}
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
					<label htmlFor="ip" className="text-xs font-medium text-white">
						IP адрес *
					</label>
					<Input
						id="ip"
						type="text"
						value={formData.ip}
						onChange={(e) => setFormData((prev) => ({ ...prev, ip: e.target.value }))}
						placeholder="192.168.1.1:25565"
						className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
					/>
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

				{/* Кнопка отправки */}
				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="bg-primary hover:bg-primary/90 text-white font-medium px-6 text-sm"
					>
						{isSubmitting ? 'Создание...' : 'Создать сервер'}
					</Button>
				</div>
			</form>
		</div>
	);
}
