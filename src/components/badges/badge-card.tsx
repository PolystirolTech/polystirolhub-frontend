'use client';

/**
 * Badge Card Component
 *
 * Card for displaying badge in lists
 */

import { BadgeImage } from './badge-image';
import { BadgeTypeBadge } from './badge-type-badge';
import { ExpirationIndicator } from './expiration-indicator';
import { formatBadgeDate, type BadgeTypeValue } from '@/lib/badges/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Badge } from '@/lib/api/generated';

interface BadgeCardProps {
	badge: Badge & { badgeType?: BadgeTypeValue | string };
	receivedAt?: string;
	expiresAt?: string | null;
	isSelected?: boolean;
	isLocked?: boolean;
	onSelect?: () => void;
	onDeselect?: () => void;
	isSelecting?: boolean;
	className?: string;
}

export function BadgeCard({
	badge,
	receivedAt,
	expiresAt,
	isSelected = false,
	isLocked = false,
	onSelect,
	onDeselect,
	isSelecting = false,
	className,
}: BadgeCardProps) {
	const description =
		badge.description && typeof badge.description === 'string'
			? badge.description
			: badge.description
				? String(badge.description || '')
				: '';
	const hasDescription = description.trim().length > 0;

	return (
		<div
			className={cn(
				'glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 rounded-lg transition-all hover:border-white/20 relative group',
				isSelected && 'ring-2 ring-primary',
				className
			)}
		>
			{hasDescription && (
				<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-[250px] whitespace-normal">
					{description}
					<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
				</div>
			)}
			<div className={cn('flex items-start gap-4', isLocked && 'opacity-50')}>
				{/* Badge Image */}
				<BadgeImage src={badge.imageUrl || ''} alt={badge.name || ''} size="lg" />

				{/* Badge Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2 mb-2">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-bold text-white truncate">{badge.name}</h3>
						</div>
						{badge.badgeType && (
							<BadgeTypeBadge
								type={
									typeof badge.badgeType === 'string' ? badge.badgeType : String(badge.badgeType)
								}
							/>
						)}
					</div>

					{/* Dates */}
					<div className="flex flex-col gap-1 mb-3">
						{receivedAt && (
							<span className="text-xs text-white/60">Получен: {formatBadgeDate(receivedAt)}</span>
						)}
						{expiresAt && typeof expiresAt === 'string' && (
							<ExpirationIndicator expiresAt={expiresAt} />
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{isLocked ? (
							<span className="text-xs text-white/40">Не получен</span>
						) : isSelected ? (
							<>
								<span className="text-xs text-primary font-medium">Выбран</span>
								{onDeselect && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onDeselect();
										}}
										disabled={isSelecting}
										className="ml-auto"
									>
										Снять
									</Button>
								)}
							</>
						) : (
							onSelect && (
								<Button
									type="button"
									variant="default"
									size="sm"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onSelect();
									}}
									disabled={isSelecting}
									className="ml-auto"
								>
									Выбрать
								</Button>
							)
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
