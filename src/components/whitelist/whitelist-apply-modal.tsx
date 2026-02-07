'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { whitelistService } from '@/lib/whitelist/whitelist-service';

interface WhitelistApplyModalProps {
	isOpen: boolean;
	onClose: () => void;
	serverId: string;
	serverName: string;
	onSuccess: () => void;
}

export function WhitelistApplyModal({
	isOpen,
	onClose,
	serverId,
	serverName,
	onSuccess,
}: WhitelistApplyModalProps) {
	const [nickname, setNickname] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setNickname('');
			setError(null);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = nickname.trim();
		if (!trimmed) {
			setError('Введите ник Minecraft');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await whitelistService.apply(serverId, trimmed);
			onSuccess();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			<div className="glass-card bg-[var(--color-secondary)] relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				<h3 className="mb-2 text-lg font-bold text-white">Подать заявку в вайтлист</h3>
				<p className="text-sm text-white/70 mb-4">
					Сервер: <span className="font-medium text-white">{serverName}</span>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor="whitelist-nickname" className="text-xs font-medium text-white">
							Ник Minecraft *
						</label>
						<Input
							id="whitelist-nickname"
							type="text"
							value={nickname}
							onChange={(e) => {
								setNickname(e.target.value);
								setError(null);
							}}
							placeholder="Steve"
							className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
							disabled={isSubmitting}
							autoFocus
						/>
					</div>

					{error && (
						<div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-2 pt-2">
						<Button type="button" onClick={onClose} variant="secondary" size="default">
							Отмена
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-primary hover:bg-primary/90 text-white"
						>
							{isSubmitting ? 'Отправка...' : 'Подать заявку'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
