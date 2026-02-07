'use client';

/**
 * Resource Progress Card Component
 *
 * Displays resource collection progress for a server
 */

import { ResourceItem } from './resource-item';
import type { ResourceProgress } from '@/lib/resource-collection';

interface ResourceProgressCardProps {
	resources: ResourceProgress[];
	serverName?: string;
}

export function ResourceProgressCard({ resources }: ResourceProgressCardProps) {
	// Filter only resources with goals or resources with current amount > 0
	const displayResources = resources.filter((r) => r.goalId || (r.currentAmount > 0 && !r.goalId));

	if (displayResources.length === 0) {
		return null;
	}

	return (
		<div className="pt-2 border-t border-white/10 mt-2">
			<div className="mb-2">
				<span className="text-xs text-white/60 block mb-1">Сбор ресурсов (/collect):</span>
			</div>
			<div className="space-y-2">
				{displayResources.map((resource, index) => (
					<ResourceItem
						key={resource.goalId || `${resource.resourceType}-${index}`}
						resource={resource}
					/>
				))}
			</div>
		</div>
	);
}
