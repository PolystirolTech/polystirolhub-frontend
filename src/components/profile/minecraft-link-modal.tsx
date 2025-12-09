'use client';

/**
 * Minecraft Link Modal Component
 *
 * Modal for linking Minecraft account via one-time code.
 * Displays code, countdown timer, and polls for link status.
 */

import { useEffect, useState, useRef } from 'react';
import { authService } from '@/lib/auth/auth-service';
import type { ExternalLinkResponse } from '@/lib/api/generated';

interface MinecraftLinkModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	onSuccess?: () => void;
}

const CODE_EXPIRY_SECONDS = 300; // 5 minutes
const POLLING_INTERVAL_MS = 4000; // 4 seconds

export function MinecraftLinkModal({
	isOpen,
	onClose,
	userId,
	onSuccess,
}: MinecraftLinkModalProps) {
	const [linkCode, setLinkCode] = useState<string | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(CODE_EXPIRY_SECONDS);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLinked, setIsLinked] = useState(false);
	const [isPolling, setIsPolling] = useState(false);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const pollingRef = useRef<NodeJS.Timeout | null>(null);

	// Format code with dash (ABCD-1234)
	const formatCode = (code: string): string => {
		if (!code) return '';
		const upperCode = code.toUpperCase();
		// If code doesn't have dash, add it after 4 characters
		if (upperCode.length > 4 && !upperCode.includes('-')) {
			return `${upperCode.slice(0, 4)}-${upperCode.slice(4)}`;
		}
		return upperCode;
	};

	// Generate link code on mount
	useEffect(() => {
		if (isOpen && !linkCode && !isGenerating) {
			generateCode();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	// Countdown timer
	useEffect(() => {
		if (isOpen && linkCode && timeRemaining > 0 && !isLinked) {
			timerRef.current = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isOpen, linkCode, timeRemaining, isLinked]);

	// Polling for link status
	useEffect(() => {
		if (isOpen && linkCode && !isLinked && timeRemaining > 0) {
			setIsPolling(true);
			pollingRef.current = setInterval(() => {
				checkLinkStatus();
			}, POLLING_INTERVAL_MS);

			// Initial check
			checkLinkStatus();
		}

		return () => {
			if (pollingRef.current) {
				clearInterval(pollingRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, linkCode, isLinked, timeRemaining]);

	// Cleanup on close
	useEffect(() => {
		if (!isOpen) {
			// Reset state
			setLinkCode(null);
			setTimeRemaining(CODE_EXPIRY_SECONDS);
			setError(null);
			setIsLinked(false);
			setIsPolling(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (pollingRef.current) {
				clearInterval(pollingRef.current);
			}
		}
	}, [isOpen]);

	// Close modal after success
	useEffect(() => {
		if (isLinked) {
			const timeout = setTimeout(() => {
				onSuccess?.();
				onClose();
			}, 2500);
			return () => clearTimeout(timeout);
		}
	}, [isLinked, onClose, onSuccess]);

	const generateCode = async () => {
		try {
			setIsGenerating(true);
			setError(null);
			const response = await authService.generateLinkCode();
			const code =
				typeof response.linkCode === 'string' ? response.linkCode : String(response.linkCode);
			setLinkCode(code);
			setTimeRemaining(CODE_EXPIRY_SECONDS);
		} catch (err) {
			console.error('Failed to generate link code:', err);
			setError(err instanceof Error ? err.message : 'Не удалось сгенерировать код');
		} finally {
			setIsGenerating(false);
		}
	};

	const checkLinkStatus = async () => {
		try {
			const response = await authService.checkLinkStatus(userId);

			// Check if links array contains MC platform
			if (response.links && Array.isArray(response.links)) {
				const mcLink = response.links.find((link: ExternalLinkResponse | unknown) => {
					const platform = typeof link === 'object' && link !== null ? (link as ExternalLinkResponse).platform : null;
					return platform === 'MC' || platform === 'mc' || platform === 'minecraft';
				});

				if (mcLink) {
					setIsLinked(true);
					setIsPolling(false);
					if (pollingRef.current) {
						clearInterval(pollingRef.current);
					}
				}
			}
		} catch (err) {
			// Log but don't show error to user - polling will continue
			console.error('Failed to check link status:', err);
		}
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// Close on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// Prevent body scroll when modal is open
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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="glass-card bg-[var(--color-secondary)] relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				{/* Title */}
				<h2 className="mb-4 text-xl font-bold text-white">Привязка Minecraft</h2>

				{/* Loading state */}
				{isGenerating && (
					<div className="flex flex-col items-center justify-center py-8">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mb-4"></div>
						<p className="text-muted">Генерация кода...</p>
					</div>
				)}

				{/* Error state */}
				{error && !isGenerating && (
					<div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
						{error}
						<button onClick={generateCode} className="mt-2 text-xs underline hover:text-red-300">
							Попробовать снова
						</button>
					</div>
				)}

				{/* Success state */}
				{isLinked && (
					<div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 text-center">
						<div className="mb-2 text-2xl">✅</div>
						<p className="font-medium">Minecraft аккаунт успешно привязан!</p>
						<p className="text-xs text-green-300 mt-1">Окно закроется автоматически...</p>
					</div>
				)}

				{/* Code display */}
				{linkCode && !isGenerating && !isLinked && (
					<>
						<div className="mb-4 text-center">
							<div className="rounded-lg bg-black/40 border-2 border-primary/50 p-4 mb-3">
								<div className="text-3xl font-mono font-bold text-primary tracking-wider mb-2">
									{formatCode(linkCode)}
								</div>
								<p className="text-xs text-muted mb-2">Отправьте в чат игры:</p>
								<code className="text-xs font-mono text-primary/80 bg-black/30 px-2 py-1 rounded">
									/link {formatCode(linkCode)}
								</code>
							</div>

							{/* Timer and status */}
							<div className="space-y-2">
								<div className="flex items-center justify-center gap-2 text-xs text-muted">
									<span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
									<span>Действителен: {formatTime(timeRemaining)}</span>
								</div>

								{timeRemaining === 0 && (
									<div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 text-xs text-yellow-400">
										Код истек. Закройте и попробуйте снова.
									</div>
								)}

								{/* Polling indicator */}
								{isPolling && timeRemaining > 0 && (
									<div className="flex items-center justify-center gap-2 text-xs text-muted">
										<div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
										<span>Ожидание привязки...</span>
									</div>
								)}
							</div>
						</div>
					</>
				)}

				{/* Actions */}
				<div className="flex gap-3 justify-end mt-4">
					<button
						onClick={onClose}
						disabled={isGenerating}
						className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium transition-all hover:bg-white/20 hover:scale-105 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLinked ? 'Закрыть' : 'Отмена'}
					</button>
					{linkCode && !isLinked && timeRemaining === 0 && (
						<button
							onClick={generateCode}
							className="px-4 py-2 rounded-lg bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:scale-105 hover:cursor-pointer"
						>
							Получить новый код
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
