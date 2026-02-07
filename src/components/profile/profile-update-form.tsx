'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { authService } from '@/lib/auth/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { cn, maskEmail } from '@/lib/utils';
import type { UpdateProfileData } from '@/lib/auth/types';

export function ProfileUpdateForm() {
	const { user, refreshUser } = useAuth();

	// Local state for form fields
	const [username, setUsername] = useState(user?.username || '');
	const [email, setEmail] = useState(user?.email || '');
	const [isEmailFocused, setIsEmailFocused] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
	const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
		user?.background || null
	);
	const [isBackgroundRemoved, setIsBackgroundRemoved] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const backgroundInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setAvatarPreview(url);
		}
	};

	const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setBackgroundPreview(url);
			setIsBackgroundRemoved(false);
		}
	};

	const handleRemoveBackground = () => {
		setBackgroundPreview(null);
		setIsBackgroundRemoved(true);
		if (backgroundInputRef.current) {
			backgroundInputRef.current.value = '';
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setMessage(null);

		try {
			// 1. Upload Avatar if changed
			if (fileInputRef.current?.files?.[0]) {
				const file = fileInputRef.current.files[0];
				await authService.uploadAvatar(file);
			}

			// 2. Upload Background if changed
			if (backgroundInputRef.current?.files?.[0]) {
				const file = backgroundInputRef.current.files[0];
				await authService.uploadBackground(file);
			}

			// 3. Update Profile Data (Username/Email/Background removal)
			const updateData: UpdateProfileData = {};
			if (username !== user?.username) updateData.username = username;
			if (email !== user?.email) updateData.email = email;

			// Handle background removal
			if (isBackgroundRemoved) {
				updateData.background = null;
			}

			// Only call PATCH if there are changes
			if (Object.keys(updateData).length > 0) {
				await authService.updateProfile(updateData);
			}

			// 4. Refresh local user state
			await refreshUser();

			setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
		} catch (error: unknown) {
			console.error('Failed to update profile:', error);
			const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении профиля';
			setMessage({ type: 'error', text: errorMessage });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 sm:p-8 mb-6">
			<h3 className="text-xl font-bold text-white mb-6">Настройки профиля</h3>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Avatar Upload */}
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
					<div className="relative group">
						<div className="h-24 w-24 overflow-hidden rounded-2xl shrink-0 border-2 border-primary/50 shadow-lg shadow-black/20">
							{avatarPreview ? (
								<Image
									src={avatarPreview}
									alt="Avatar preview"
									className="h-full w-full object-cover"
									width={96}
									height={96}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
									{username.substring(0, 2).toUpperCase()}
								</div>
							)}
						</div>
						<div
							onClick={() => fileInputRef.current?.click()}
							className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
						>
							<span className="i-bi-camera text-white text-2xl" />
							<span className="sr-only">Изменить фото</span>
						</div>
					</div>

					<div className="flex-1 w-full text-center sm:text-left">
						<h4 className="text-sm font-medium text-white mb-1">Фото профиля</h4>
						<p className="text-xs text-muted mb-3">
							Нажмите на фото, чтобы изменить его. Форматы: JPG, PNG.
						</p>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
							className="bg-white/10 hover:bg-white/20 text-white border-0 w-full sm:w-auto"
						>
							Загрузить новое
						</Button>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleImageChange}
							accept="image/*"
							className="hidden"
						/>
					</div>
				</div>

				{/* Background Upload */}
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-4 border-t border-white/10">
					<div className="relative group">
						<div className="h-24 w-40 overflow-hidden rounded-xl shrink-0 border-2 border-primary/50 shadow-lg shadow-black/20 bg-black/40">
							{backgroundPreview ? (
								<Image
									src={backgroundPreview}
									alt="Background preview"
									className="h-full w-full object-cover"
									width={160}
									height={96}
									unoptimized
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-xs text-muted/60">
									Нет фона
								</div>
							)}
						</div>
						<div
							onClick={() => backgroundInputRef.current?.click()}
							className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
						>
							<span className="i-bi-image text-white text-2xl" />
							<span className="sr-only">Изменить фон</span>
						</div>
					</div>

					<div className="flex-1 w-full text-center sm:text-left">
						<h4 className="text-sm font-medium text-white mb-1">Фон сайта</h4>
						<p className="text-xs text-muted mb-3">
							Персональный фон для всего сайта. Виден только вам.
						</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => backgroundInputRef.current?.click()}
								className="bg-white/10 hover:bg-white/20 text-white border-0 w-full sm:w-auto"
							>
								Загрузить фон
							</Button>
							{backgroundPreview && (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={handleRemoveBackground}
									className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border-0 w-full sm:w-auto"
								>
									Удалить
								</Button>
							)}
						</div>
						<input
							type="file"
							ref={backgroundInputRef}
							onChange={handleBackgroundChange}
							accept="image/*"
							className="hidden"
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<label htmlFor="username" className="text-sm font-medium text-white">
							Имя пользователя
						</label>
						<Input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Ваш никнейм"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium text-white">
							Email
						</label>
						<Input
							id="email"
							type={isEmailFocused ? 'email' : 'text'}
							value={isEmailFocused ? email : maskEmail(email)}
							onChange={(e) => setEmail(e.target.value)}
							onFocus={() => setIsEmailFocused(true)}
							onBlur={() => setIsEmailFocused(false)}
							placeholder="example@mail.com"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50"
						/>
					</div>
				</div>

				{message && (
					<div
						className={cn(
							'p-3 rounded-lg text-sm border',
							message.type === 'success'
								? 'bg-green-500/10 border-green-500/20 text-green-400'
								: 'bg-red-500/10 border-red-500/20 text-red-400'
						)}
					>
						{message.text}
					</div>
				)}

				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="bg-primary hover:bg-primary/90 text-white font-medium px-4 sm:px-8 w-full sm:w-auto"
					>
						{isSubmitting ? (
							'Сохранение...'
						) : (
							<>
								<span className="sm:hidden">Сохранить</span>
								<span className="hidden sm:inline">Сохранить изменения</span>
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
