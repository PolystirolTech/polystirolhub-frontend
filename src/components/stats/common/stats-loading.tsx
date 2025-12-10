'use client';

interface StatsLoadingProps {
	message?: string;
}

export function StatsLoading({ message = 'Загрузка...' }: StatsLoadingProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mb-4"></div>
			<p className="text-muted">{message}</p>
		</div>
	);
}
