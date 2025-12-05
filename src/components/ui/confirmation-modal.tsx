'use client';

/**
 * Confirmation Modal Component
 * 
 * Reusable modal for confirming dangerous or important actions.
 */

import { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
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
}: ConfirmationModalProps) {
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
            <div className="glass-card bg-[var(--color-secondary)]/50 backdrop-blur-md border border-white/10 relative max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                {/* Title */}
                <h2 className="mb-3 text-xl font-bold text-white">{title}</h2>

                {/* Message */}
                <p className="mb-6 text-muted leading-relaxed">{message}</p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium transition-all hover:bg-white/20 hover:scale-105 hover:cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:cursor-pointer ${isDangerous
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
