'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useLevel } from '@/lib/level/level-context';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useApiStatus } from '@/hooks/use-api-status';

export function Header() {
	const { user, isAuthenticated, logout, isLoading } = useAuth();
	const { status: apiStatus } = useApiStatus();
	const { level, currentXp, nextLevelXp } = useLevel();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const handleLogout = async () => {
		await logout();
		window.location.href = '/';
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50 p-6">
			<div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
				{/* Block 1: Logo / Project Name */}
				<div className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-6 shadow-lg transition-transform hover:scale-[1.02]">
					<Link
						href="/"
						className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
					>
						polystirolhub
					</Link>
				</div>

				{/* Navigation Links */}
				<Link
					href="/servers"
					className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02]"
				>
					<span className="text-sm font-medium text-white/90">Сервера</span>
				</Link>
				<Link
					href="/stats"
					className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02]"
				>
					<span className="text-sm font-medium text-white/90">Статистика</span>
				</Link>
				<Link
					href="/shop"
					className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02]"
				>
					<span className="text-sm font-medium text-white/90">Магазин</span>
				</Link>

				{/* Authenticated User Blocks */}
				{/* Показываем блок профиля если есть данные пользователя (даже во время загрузки) */}
				{user && (
					<>
						{/* Block 2: Profile */}
						<Link
							href="/profile"
							className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-3 rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02] relative group/profile"
							style={
								{
									'--progress-percent': `${(currentXp / nextLevelXp) * 100}%`,
								} as React.CSSProperties
							}
						>
							{/* Avatar */}
							<div className="h-8 w-8 overflow-hidden rounded-md bg-gradient-to-br from-primary to-secondary">
								{user.avatar ? (
									<Image
										src={user.avatar}
										alt={user.username}
										className="h-full w-full object-cover"
										width={32}
										height={32}
										unoptimized
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
										{user.username.substring(0, 2).toUpperCase()}
									</div>
								)}
							</div>

							{/* Username */}
							<span className="text-sm font-medium text-white/90">{user.username}</span>
							{/* Level Badge in Header */}
							<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
								{level}
							</span>

							{/* Progress Border using pseudo-element */}
							<span
								className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
								style={{
									background: `conic-gradient(from 0deg at 50% 50%, var(--color-primary) 0%, var(--color-primary) var(--progress-percent), transparent var(--progress-percent))`,
									WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
									WebkitMaskComposite: 'xor',
									mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
									maskComposite: 'exclude',
									padding: '2px',
								}}
							/>
						</Link>

						{/* Block 3: Logout */}
						<button
							onClick={() => setShowLogoutConfirm(true)}
							className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02] hover:bg-red-500/80 hover:cursor-pointer"
						>
							<svg
								className="h-7 w-7 text-white/80"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								shapeRendering="crispEdges"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
						</button>
					</>
				)}

				{/* Unauthenticated User Block */}
				{!isAuthenticated && !isLoading && (
					<Link
						href="/login"
						className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-6 shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/20"
					>
						<span className="text-sm font-medium text-white/90">Вход</span>
					</Link>
				)}

				{/* Block 4: API Status Indicator */}
				<div className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-3 rounded-2xl px-6 shadow-lg transition-transform">
					<span className="relative flex h-2.5 w-2.5">
						{apiStatus === 'online' && (
							<>
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
								<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
							</>
						)}
						{apiStatus === 'checking' && (
							<>
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
								<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
							</>
						)}
						{apiStatus === 'offline' && (
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
						)}
					</span>
				</div>
			</div>

			{/* Logout Confirmation Modal */}
			<ConfirmationModal
				isOpen={showLogoutConfirm}
				onClose={() => setShowLogoutConfirm(false)}
				onConfirm={handleLogout}
				title="Подтверждение выхода"
				message="Вы уверены, что хотите выйти из аккаунта?"
				confirmText="Выйти"
				cancelText="Отмена"
				isDangerous={true}
			/>
		</header>
	);
}
