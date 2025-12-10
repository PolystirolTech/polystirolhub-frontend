'use client';

interface StatsEmptyProps {
	message?: string;
	description?: string;
}

export function StatsEmpty({ message = 'Нет данных', description }: StatsEmptyProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div className="mb-4 text-white/40 text-4xl">📊</div>
			<p className="text-white/60 mb-2 text-center font-medium">{message}</p>
			{description && <p className="text-white/40 text-sm text-center">{description}</p>}
		</div>
	);
}
