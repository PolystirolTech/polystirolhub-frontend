'use client';

import { useAuth } from '@/lib/auth';
import { useLevel } from '@/lib/level/level-context';
import Image from 'next/image';
import Link from 'next/link';
import { UserBadgeDisplay } from '@/components/badges/user-badge-display';

export function ProfileWidget() {
	const { user } = useAuth();
	const { level, currentXp, nextLevelXp } = useLevel();

	if (!user) {
		return (
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg">
				<p className="text-sm text-white/60">Войдите для просмотра профиля</p>
			</div>
		);
	}

	return (
		<Link
			href="/profile"
			className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4 shadow-lg transition-all hover:scale-[1.02] block"
			style={
				{
					'--progress-percent': `${(currentXp / nextLevelXp) * 100}%`,
				} as React.CSSProperties
			}
		>
			<div className="flex items-center gap-3">
				<div className="h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-secondary">
					{user.avatar ? (
						<Image
							src={user.avatar}
							alt={user.username}
							className="h-full w-full object-cover"
							width={48}
							height={48}
							unoptimized
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
							{user.username.substring(0, 2).toUpperCase()}
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="font-bold text-white truncate">{user.username}</h3>
						{user.selected_badge_id && (
							<UserBadgeDisplay badgeId={user.selected_badge_id} size="sm" />
						)}
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
							{level}
						</span>
					</div>
					<div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
						<div
							className="h-full bg-primary transition-all"
							style={{ width: `${(currentXp / nextLevelXp) * 100}%` }}
						/>
					</div>
					<p className="mt-1 text-xs text-white/60">
						{currentXp} / {nextLevelXp} XP
					</p>
				</div>
			</div>
		</Link>
	);
}
