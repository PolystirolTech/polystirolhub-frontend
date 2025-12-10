'use client';

interface StatsErrorProps {
	message?: string;
	onRetry?: () => void;
}

export function StatsError({
	message = 'Произошла ошибка при загрузке данных',
	onRetry,
}: StatsErrorProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div className="mb-4 text-red-400 text-4xl">⚠️</div>
			<p className="text-red-400 mb-4 text-center">{message}</p>
			{onRetry && (
				<button
					onClick={onRetry}
					className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium transition-all hover:bg-red-500/20 cursor-pointer"
				>
					Попробовать снова
				</button>
			)}
		</div>
	);
}
