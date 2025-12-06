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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create a preview URL immediately for UI
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);

            // Automatically upload avatar when selected (as per user instruction logic implication or standard UX?
            // User requirement: "При загрузке нового...". Usually it's better to upload on save, OR upload immediately.
            // The instructions separate the endpoints. Let's look at requirements.
            // "Загрузить аватар (файл)... Успешный ответ (200)..."
            // "Обновить профиль... PATCH..."
            // It seems they are separate. I will upload immediately when file is selected, or on save?
            // PROMPT SAID: "Загрузить аватар (файл)... Примечания: Старый аватар удаляется автоматически при загрузке нового... URL аватара сохраняется в БД"
            // If I upload immediately, it saves immediately.
            // If I wait for "Save" button, I need to handle both calls.
            // Let's implement: Upload avatar immediately on selection (to show it's "uploaded"), AND update text fields on "Save".
            // OR better UX: Wait for save button for everything?
            // "При обновлении аватара через URL старый локальный файл удаляется автоматически" (PATCH)
            // But POST /avatar also uploads.
            // Let's try to do it all on "Save".
            // Steps on Save:
            // 1. If new file selected -> uploadAvatar -> get new URL.
            // 2. Prepare patch data (username, email, [avatar if we used POST? No, POST updates user directly]).
            // If POST updates user directly, we don't need to send avatar URL in PATCH unless we are setting an external URL.
            // The POST response returns updated User object.

            // Let's do it on Save to be atomic from user perspective.
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
                // Note: consecutive updates might race if we are not careful, but usually okay.
                // The uploadAvatar returns the updated user.
            }

            // 2. Update Profile Data (Username/Email)
            // Only send if changed
            const updateData: UpdateProfileData = {};
            if (username !== user?.username) updateData.username = username;
            if (email !== user?.email) updateData.email = email;

            // Only call PATCH if there are changes
            if (Object.keys(updateData).length > 0) {
                await authService.updateProfile(updateData);
            }

            // 3. Refresh local user state
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
        <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 mb-6">
            <h3 className="text-xl font-bold text-white mb-6">Настройки профиля</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="h-24 w-24 overflow-hidden rounded-2xl shrink-0 border-2 border-primary/50">
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

                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">Фото профиля</h4>
                        <p className="text-xs text-muted mb-3">
                            Нажмите на фото, чтобы изменить его. Форматы: JPG, PNG.
                        </p>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/10 hover:bg-white/20 text-white border-0"
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

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-8"
                    >
                        {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
