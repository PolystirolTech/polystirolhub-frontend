'use client';

/**
 * Resource Item Component
 *
 * Displays a single resource with progress bar (if goal exists) or just current amount
 */

import type { ResourceProgress } from '@/lib/resource-collection';

interface ResourceItemProps {
	resource: ResourceProgress;
}

export function ResourceItem({ resource }: ResourceItemProps) {
	const hasGoal =
		resource.targetAmount !== undefined && resource.targetAmount !== null && resource.goalId;
	const progressPercent =
		resource.progressPercentage ??
		(hasGoal && resource.targetAmount
			? Math.min(100, (resource.currentAmount / resource.targetAmount) * 100)
			: 0);

	return (
		<div className="rounded-lg bg-white/5 p-2">
			<div className="mb-1 flex items-center justify-between">
				<div className="flex-1 min-w-0">
					{resource.name ? (
						<span className="text-xs font-medium text-white truncate block">{resource.name}</span>
					) : (
						<span className="text-xs font-medium text-white/80 truncate block capitalize">
							{resource.resourceType}
						</span>
					)}
				</div>
				{hasGoal && resource.progressPercentage !== undefined && (
					<span className="text-xs text-white/60 ml-2 whitespace-nowrap">
						{resource.progressPercentage.toFixed(2)}%
					</span>
				)}
			</div>

			{hasGoal && typeof resource.targetAmount === 'number' ? (
				<>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 mb-1">
						<div
							className={`h-full transition-all ${
								progressPercent >= 100 ? 'bg-green-500' : 'bg-primary'
							}`}
							style={{ width: `${Math.min(100, progressPercent)}%` }}
						/>
					</div>
					<p className="text-xs text-white/40">
						{resource.currentAmount.toLocaleString('ru-RU')} /{' '}
						{typeof resource.targetAmount === 'number'
							? resource.targetAmount.toLocaleString('ru-RU')
							: '—'}
					</p>
					{progressPercent >= 100 && (
						<p className="mt-1 text-xs text-green-400 font-medium">✓ Цель достигнута</p>
					)}
				</>
			) : (
				<p className="text-xs text-white/60">
					Текущее: {resource.currentAmount.toLocaleString('ru-RU')}
				</p>
			)}
		</div>
	);
}
