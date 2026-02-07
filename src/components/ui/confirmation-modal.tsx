'use client';

/**
 * Confirmation Modal Component
 *
 * Reusable modal for confirming dangerous or important actions.
 */

import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	isDangerous?: boolean;
	validationString?: string; // If provided, user must type this string to confirm
	validationPlaceholder?: string;
}

export function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	isDangerous = false,
	validationString,
	validationPlaceholder,
}: ConfirmationModalProps) {
	const [inputValue, setInputValue] = useState('');
	const isConfirmDisabled = validationString ? inputValue !== validationString : false;

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
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
				{/* Title */}
				<h2 className="mb-3 text-xl font-bold text-white">{title}</h2>

				{/* Message */}
				<p className="mb-6 text-muted leading-relaxed">{message}</p>

				{/* Validation Input */}
				{validationString && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-muted mb-2">
							Введите <span className="text-white font-bold select-all">{validationString}</span>{' '}
							для подтверждения
						</label>
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder={validationPlaceholder}
							className="w-full rounded-lg bg-black/20 border border-white/10 px-4 py-2 text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							autoFocus
						/>
					</div>
				)}

				{/* Actions */}

				<div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium transition-all hover:bg-white/20 hover:scale-105 hover:cursor-pointer w-full sm:w-auto order-2 sm:order-1"
					>
						{cancelText}
					</button>
					<button
						onClick={() => {
							if (!isConfirmDisabled) {
								onConfirm();
								onClose();
							}
						}}
						disabled={isConfirmDisabled}
						className={`px-4 py-2 rounded-lg font-medium transition-all w-full sm:w-auto order-1 sm:order-2 ${
							isConfirmDisabled
								? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
								: 'hover:scale-105 hover:cursor-pointer'
						} ${
							!isConfirmDisabled && isDangerous
								? 'bg-red-500 text-white hover:bg-red-600'
								: !isConfirmDisabled
									? 'bg-primary text-white hover:bg-primary/90'
									: ''
						}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
