'use client';

/**
 * Badge Edit Modal
 *
 * Modal for editing existing badges
 */

import { useState, useRef, useEffect } from 'react';
import { badgeService, type BadgeCondition } from '@/lib/badges/badge-service';
import { validateImageFile } from '@/lib/badges/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeImage } from '@/components/badges/badge-image';
import type { Badge } from '@/lib/api/generated';
import type { BadgeTypeValue } from '@/lib/badges/types';

interface BadgeEditModalProps {
	badge: Badge;
	onSuccess: () => void;
	onCancel: () => void;
}

export function BadgeEditModal({ badge, onSuccess, onCancel }: BadgeEditModalProps) {
	const [name, setName] = useState(badge.name || '');
	const [description, setDescription] = useState(
		typeof badge.description === 'string' ? badge.description : ''
	);
	const [badgeType, setBadgeType] = useState<BadgeTypeValue>(
		(badge.badgeType as BadgeTypeValue) || 'permanent'
	);
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(badge.imageUrl || null);
	const [conditionKey, setConditionKey] = useState(
		typeof badge.conditionKey === 'string' ? badge.conditionKey : ''
	);
	const [targetValue, setTargetValue] = useState<number | ''>(
		typeof badge.targetValue === 'number' ? badge.targetValue : ''
	);
	const [autoCheck, setAutoCheck] = useState(
		typeof badge.autoCheck === 'boolean' ? badge.autoCheck : false
	);
	const [rewardXp, setRewardXp] = useState<number | ''>(
		typeof badge.rewardXp === 'number' ? badge.rewardXp : ''
	);
	const [rewardBalance, setRewardBalance] = useState<number | ''>(
		typeof badge.rewardBalance === 'number' ? badge.rewardBalance : ''
	);
	const [unicodeChar, setUnicodeChar] = useState(
		typeof badge.unicodeChar === 'string' ? badge.unicodeChar : ''
	);
	const [conditions, setConditions] = useState<BadgeCondition[]>([]);
	const [selectedCondition, setSelectedCondition] = useState<BadgeCondition | null>(null);
	const [isLoadingConditions, setIsLoadingConditions] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		async function loadConditions() {
			try {
				setIsLoadingConditions(true);
				const data = await badgeService.getBadgeConditions();
				setConditions(data);
			} catch (err) {
				console.error('Failed to load conditions:', err);
			} finally {
				setIsLoadingConditions(false);
			}
		}
		loadConditions();
	}, []);

	useEffect(() => {
		setName(badge.name || '');
		setDescription(typeof badge.description === 'string' ? badge.description : '');
		setBadgeType((badge.badgeType as BadgeTypeValue) || 'permanent');
		setImagePreview(badge.imageUrl || null);
		setImage(null);
		setConditionKey(typeof badge.conditionKey === 'string' ? badge.conditionKey : '');
		setTargetValue(typeof badge.targetValue === 'number' ? badge.targetValue : '');
		setAutoCheck(typeof badge.autoCheck === 'boolean' ? badge.autoCheck : false);
		setRewardXp(typeof badge.rewardXp === 'number' ? badge.rewardXp : '');
		setRewardBalance(typeof badge.rewardBalance === 'number' ? badge.rewardBalance : '');
		setUnicodeChar(typeof badge.unicodeChar === 'string' ? badge.unicodeChar : '');
	}, [badge]);

	useEffect(() => {
		if (conditionKey) {
			const condition = conditions.find((c) => c.key === conditionKey);
			setSelectedCondition(condition || null);
		} else {
			setSelectedCondition(null);
		}
	}, [conditionKey, conditions]);

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

		// Validate condition requirements
		if (conditionKey && selectedCondition) {
			if (
				selectedCondition.requiresTargetValue &&
				(targetValue === '' || targetValue === undefined)
			) {
				setError(`Для условия "${selectedCondition.name}" требуется указать целевое значение`);
				return;
			}
			if (selectedCondition.requiresAutoCheck && !autoCheck) {
				setError(
					`Для условия "${selectedCondition.name}" требуется включить автоматическую проверку`
				);
				return;
			}
		}

		try {
			setIsSubmitting(true);
			const updateData: {
				name?: string;
				description?: string;
				badgeType?: BadgeTypeValue;
				image?: File;
				conditionKey?: string;
				targetValue?: number;
				autoCheck?: boolean;
				rewardXp?: number;
				rewardBalance?: number;
				unicodeChar?: string;
			} = {};

			if (name.trim() !== badge.name) {
				updateData.name = name.trim();
			}
			if (description.trim() !== (typeof badge.description === 'string' ? badge.description : '')) {
				updateData.description = description.trim();
			}
			if (badgeType !== badge.badgeType) {
				updateData.badgeType = badgeType;
			}
			if (image) {
				updateData.image = image;
			}
			const currentConditionKey = typeof badge.conditionKey === 'string' ? badge.conditionKey : '';
			if (conditionKey.trim() !== currentConditionKey) {
				updateData.conditionKey = conditionKey.trim() || undefined;
			}
			const currentTargetValue = typeof badge.targetValue === 'number' ? badge.targetValue : '';
			if (targetValue !== currentTargetValue) {
				updateData.targetValue = targetValue !== '' ? Number(targetValue) : undefined;
			}
			const currentAutoCheck = typeof badge.autoCheck === 'boolean' ? badge.autoCheck : false;
			if (autoCheck !== currentAutoCheck) {
				updateData.autoCheck = autoCheck;
			}
			const currentRewardXp = typeof badge.rewardXp === 'number' ? badge.rewardXp : '';
			if (rewardXp !== currentRewardXp) {
				updateData.rewardXp = rewardXp !== '' ? Number(rewardXp) : undefined;
			}
			const currentRewardBalance =
				typeof badge.rewardBalance === 'number' ? badge.rewardBalance : '';
			if (rewardBalance !== currentRewardBalance) {
				updateData.rewardBalance = rewardBalance !== '' ? Number(rewardBalance) : undefined;
			}
			const currentUnicodeChar = typeof badge.unicodeChar === 'string' ? badge.unicodeChar : '';
			if (unicodeChar.trim() !== currentUnicodeChar) {
				updateData.unicodeChar = unicodeChar.trim() || undefined;
			}

			// Only update if there are changes
			if (Object.keys(updateData).length > 0) {
				await badgeService.updateBadge(badge.id || '', updateData);
			}
			onSuccess();
		} catch (err: unknown) {
			console.error('Failed to update badge:', err);
			setError(err instanceof Error ? err.message : 'Не удалось обновить бэйджик');
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
				<h2 className="mb-4 text-2xl font-bold text-white">Редактировать бэйджик</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Название</label>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Введите название бэйджа"
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
						<label className="block text-sm font-medium text-white/90 mb-2">Тип</label>
						<select
							value={badgeType}
							onChange={(e) => setBadgeType(e.target.value as BadgeTypeValue)}
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
						>
							<option value="permanent">Постоянный</option>
							<option value="temporary">Временный</option>
							<option value="event">Ивентовый</option>
						</select>
					</div>

					{/* Image Upload */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Изображение</label>
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

					{/* Condition Key */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">
							Условие получения
						</label>
						{isLoadingConditions ? (
							<div className="text-sm text-white/60">Загрузка условий...</div>
						) : (
							<>
								<select
									value={conditionKey}
									onChange={(e) => setConditionKey(e.target.value)}
									className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
								>
									<option value="">Без условия</option>
									{conditions.map((condition) => (
										<option key={condition.key} value={condition.key}>
											{condition.name}
										</option>
									))}
								</select>
								{selectedCondition && (
									<div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
										<p className="text-sm font-medium text-white mb-1">{selectedCondition.name}</p>
										<p className="text-xs text-white/70 mb-2">{selectedCondition.description}</p>
										<div className="flex flex-wrap gap-2 text-xs">
											<span className="px-2 py-1 rounded bg-white/10 text-white/80">
												Тип: {selectedCondition.type === 'periodic' ? 'Периодическое' : 'Событие'}
											</span>
											{selectedCondition.requiresTargetValue && (
												<span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
													Требуется целевое значение
												</span>
											)}
											{selectedCondition.requiresAutoCheck && (
												<span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
													Требуется авто-проверка
												</span>
											)}
											{selectedCondition.implementationStatus && (
												<span className="px-2 py-1 rounded bg-white/10 text-white/60">
													{selectedCondition.implementationStatus}
												</span>
											)}
										</div>
									</div>
								)}
							</>
						)}
					</div>

					{/* Target Value */}
					{selectedCondition?.requiresTargetValue && (
						<div>
							<label className="block text-sm font-medium text-white/90 mb-2">
								Целевое значение <span className="text-red-400">*</span>
							</label>
							<Input
								type="number"
								value={targetValue}
								onChange={(e) =>
									setTargetValue(e.target.value === '' ? '' : Number(e.target.value))
								}
								placeholder="Целевое значение"
								required
							/>
						</div>
					)}
					{!selectedCondition?.requiresTargetValue && conditionKey && (
						<div>
							<label className="block text-sm font-medium text-white/90 mb-2">
								Целевое значение
							</label>
							<Input
								type="number"
								value={targetValue}
								onChange={(e) =>
									setTargetValue(e.target.value === '' ? '' : Number(e.target.value))
								}
								placeholder="Целевое значение (опционально)"
							/>
						</div>
					)}

					{/* Auto Check */}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="autoCheck"
							checked={autoCheck}
							onChange={(e) => setAutoCheck(e.target.checked)}
							className="h-4 w-4 rounded border-input bg-background/50 text-primary focus:ring-2 focus:ring-ring"
							required={selectedCondition?.requiresAutoCheck}
						/>
						<label htmlFor="autoCheck" className="text-sm font-medium text-white/90">
							Автоматическая проверка
							{selectedCondition?.requiresAutoCheck && <span className="text-red-400 ml-1">*</span>}
						</label>
					</div>

					{/* Reward XP */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Награда XP</label>
						<Input
							type="number"
							value={rewardXp}
							onChange={(e) => setRewardXp(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="0"
						/>
					</div>

					{/* Reward Balance */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Награда в валюте</label>
						<Input
							type="number"
							value={rewardBalance}
							onChange={(e) =>
								setRewardBalance(e.target.value === '' ? '' : Number(e.target.value))
							}
							placeholder="0"
						/>
					</div>

					{/* Unicode Char */}
					<div>
						<label className="block text-sm font-medium text-white/90 mb-2">Юникод символ</label>
						<Input
							type="text"
							value={unicodeChar}
							onChange={(e) => setUnicodeChar(e.target.value)}
							placeholder="Автоматически, если не указан"
						/>
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
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
