'use client';

import { ReactNode } from 'react';

interface StatsSectionProps {
	title: string;
	children: ReactNode;
	className?: string;
}

export function StatsSection({ title, children, className = '' }: StatsSectionProps) {
	return (
		<div
			className={`glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 mb-6 ${className}`}
		>
			<h3 className="text-xl font-bold text-white mb-4">{title}</h3>
			{children}
		</div>
	);
}
