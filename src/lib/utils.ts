/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function maskEmail(email: string | null | undefined): string {
	if (!email) return '';

	const [local, domain] = email.split('@');
	if (!domain) return email; // Invalid email, return as is

	let maskedLocal = local;
	if (local.length > 2) {
		maskedLocal = `${local.substring(0, 2)}****`;
	} else {
		maskedLocal = `${local}****`;
	}

	return `${maskedLocal}@${domain}`;
}

/**
 * Format a date to a localized string
 */
export const formatDate = (date: Date | string): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};
