'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Check if user has already consented
		const consent = localStorage.getItem('cookie-consent');
		if (!consent) {
			// Show banner after a small delay for better UX
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const acceptCookies = () => {
		localStorage.setItem('cookie-consent', 'true');
		setIsVisible(false);
	};

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full duration-500">
			<div className="mx-auto max-w-7xl">
				<div className="glass-card bg-[var(--color-secondary)]/80 backdrop-blur-xl border border-white/10 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
					<div className="flex-1 text-center md:text-left">
						<p className="text-sm text-white/90">
							Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая
							использовать сайт, вы соглашаетесь с нашей{' '}
							<Link href="/legal/privacy" className="text-primary hover:underline font-medium">
								Политикой конфиденциальности
							</Link>
							.
						</p>
					</div>
					<div className="flex flex-shrink-0 gap-3">
						<button
							onClick={acceptCookies}
							className="glass bg-primary/90 hover:bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
						>
							Понятно
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
