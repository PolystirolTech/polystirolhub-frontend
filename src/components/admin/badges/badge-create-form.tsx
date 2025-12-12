'use client';

/**
 * Badge Create Form
 *
 * Form for creating new badges
 */

import { useState, useRef } from 'react';
import { badgeService } from '@/lib/badges/badge-service';
import { validateImageFile } from '@/lib/badges/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeImage } from '@/components/badges/badge-image';
import type { BadgeTypeValue } from '@/lib/badges/types';

interface BadgeCreateFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

export function BadgeCreateForm({ onSuccess, onCancel }: BadgeCreateFormProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [badgeType, setBadgeType] = useState<BadgeTypeValue>('permanent');
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validation = validateImageFile(file);
		if (!validation.valid) {
			setError(validation.error || 'Неверный файл');
			return;
		}

		setImage(file);
		setError(null);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		const validation = validateImageFile(file);
		if (!validation.valid) {
			setError(validation.error || 'Неверный файл');
			return;
		}

		setImage(file);
		setError(null);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError('Название обязательно');
			return;
		}

		if (!image) {
			setError('Изображение обязательно');
			return;
		}

		try {
			setIsSubmitting(true);
			await badgeService.createBadge({
				name: name.trim(),
				description: description.trim() || undefined,
				badgeType,
				image,
			});
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to create badge:', err);
			setError(err instanceof Error ? err.message : 'Не удалось создать бэйджик');
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
			<div className="glass-card bg-[var(--color-secondary)] relative max-w-2xl w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
				<h2 className="mb-4 text-2xl font-bold text-white">Создать бэйджик</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Название <span className="text-red-400">*</span>
						</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Введите название бэйджа"
							required
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Описание</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Введите описание бэйджа"
							className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm resize-none"
							rows={3}
						/>
					</div>

					{/* Badge Type */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Тип <span className="text-red-400">*</span>
						</label>
						<select
							value={badgeType}
							onChange={(e) => setBadgeType(e.target.value as BadgeTypeValue)}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							required
						>
							<option value="permanent">Постоянный</option>
							<option value="temporary">Временный</option>
							<option value="event">Ивентовый</option>
						</select>
					</div>

					{/* Image Upload */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Изображение <span className="text-red-400">*</span>
						</label>
						<div
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-white/40 transition-colors"
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								onChange={handleImageChange}
								className="hidden"
							/>
							{imagePreview ? (
								<div className="flex flex-col items-center gap-4">
									<BadgeImage src={imagePreview} alt="Preview" size="lg" />
									<p className="text-sm text-white/60">Нажмите для изменения</p>
								</div>
							) : (
								<div>
									<p className="text-white/60 mb-2">
										Перетащите изображение сюда или нажмите для выбора
									</p>
									<p className="text-xs text-white/40">JPEG, PNG или WebP, до 5MB</p>
								</div>
							)}
						</div>
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
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Создание...' : 'Создать'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
