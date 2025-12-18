'use client';

import { useState, useEffect, useRef } from 'react';

export function GazosvarkaEasterEgg() {
	const [isActive, setIsActive] = useState(false);
	const keySequenceRef = useRef(0);
	const clickCountRef = useRef(0);
	const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

	const activate = () => {
		setIsActive(true);
		setTimeout(() => setIsActive(false), 5000);
	};

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			const sequence = 'gazosvarka';
			if (e.key.toLowerCase() === sequence[keySequenceRef.current]) {
				keySequenceRef.current += 1;
				if (keySequenceRef.current === sequence.length) {
					activate();
					keySequenceRef.current = 0;
				}
			} else {
				keySequenceRef.current = 0;
			}
		};

		// Тройной клик на заголовок баннера
		const handleTripleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.closest('[data-easter-egg-trigger]')) {
				if (clickTimerRef.current) {
					clearTimeout(clickTimerRef.current);
				}

				clickCountRef.current += 1;

				if (clickCountRef.current === 3) {
					activate();
					clickCountRef.current = 0;
				} else {
					clickTimerRef.current = setTimeout(() => {
						clickCountRef.current = 0;
					}, 500);
				}
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('click', handleTripleClick);
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('click', handleTripleClick);
			if (clickTimerRef.current) {
				clearTimeout(clickTimerRef.current);
			}
		};
	}, []);

	if (!isActive) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="glass-card bg-[var(--color-secondary)]/90 border-2 border-primary/50 p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-500">
				<div className="text-6xl mb-4 animate-bounce">🔥</div>
				<h2 className="text-3xl font-bold text-primary mb-4">Газосварка</h2>
				<p className="text-white/90 mb-2">Легенда ПостиралБлока</p>
				<p className="text-sm text-white/60">Мастер газосварки и не только...</p>
				<div className="mt-6 pt-4 border-t border-white/10">
					<p className="text-xs text-white/40">Пасхалка активирована! Спасибо!</p>
				</div>
			</div>
		</div>
	);
}
