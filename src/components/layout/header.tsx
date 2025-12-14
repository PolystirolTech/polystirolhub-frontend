'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useLevel } from '@/lib/level/level-context';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useApiStatus } from '@/hooks/use-api-status';
import { useBalance } from '@/hooks/use-balance';
import { UserBadgeDisplay } from '@/components/badges/user-badge-display';

export function Header() {
	const { user, isAuthenticated, logout, isLoading } = useAuth();
	const { status: apiStatus } = useApiStatus();
	const { level, currentXp, nextLevelXp } = useLevel();
	const { balance, isLoading: isBalanceLoading } = useBalance();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

	const handleLogout = async () => {
		await logout();
		window.location.href = '/';
	};

	// Закрытие мобильного меню при клике вне его
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(target) &&
				mobileMenuButtonRef.current &&
				!mobileMenuButtonRef.current.contains(target)
			) {
				setIsMobileMenuOpen(false);
			}
		};

		if (isMobileMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMobileMenuOpen]);

	// Закрытие меню при переходе по ссылке
	const handleLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-6">
			<div className="mx-auto flex max-w-5xl items-center justify-between md:justify-center gap-2">
				{/* Block 1: Logo / Project Name */}
				<div className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-3 sm:px-6 shadow-lg transition-transform hover:scale-[1.02]">
					<Link
						href="/"
						className="text-base sm:text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
					>
						<span className="hidden sm:inline">polystirolhub</span>
						<span className="sm:hidden">plstrl</span>
					</Link>
				</div>

				{/* Desktop/MD Navigation - скрыта на мобильных */}
				<div className="hidden md:flex items-center gap-2">
					{/* Navigation Links */}
					<Link
						href="/servers"
						className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02]"
						title="Сервера"
					>
						<svg
							className="h-5 w-5 text-white/90"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
							/>
						</svg>
						<span className="hidden lg:inline ml-2 text-sm font-medium text-white/90">Сервера</span>
					</Link>
					<Link
						href="/stats"
						className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02]"
						title="Статистика"
					>
						<svg
							className="h-5 w-5 text-white/90"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<span className="hidden lg:inline ml-2 text-sm font-medium text-white/90">
							Статистика
						</span>
					</Link>
					<Link
						href="/shop"
						className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02]"
						title="Магазин"
					>
						<svg
							className="h-5 w-5 text-white/90"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
							/>
						</svg>
						<span className="hidden lg:inline ml-2 text-sm font-medium text-white/90">Магазин</span>
					</Link>

					{/* Admin Link - Only for admins */}
					{user && (user.is_admin || user.is_super_admin) && (
						<Link
							href="/admin"
							className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02]"
							title="Админ"
						>
							<svg
								className="h-5 w-5 text-white/90"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<span className="hidden lg:inline ml-2 text-sm font-medium text-white/90">Админ</span>
						</Link>
					)}
				</div>

				{/* Desktop/MD User Blocks - скрыты на мобильных */}
				<div className="hidden md:flex items-center gap-2">
					{/* Authenticated User Blocks */}
					{user && (
						<>
							{/* Block: Balance */}
							<div className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 lg:gap-3 rounded-2xl px-3 lg:px-4 shadow-lg transition-transform">
								<svg
									className="h-5 w-5 text-white/90"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{isBalanceLoading ? (
									<div className="h-4 w-8 animate-pulse bg-white/20 rounded"></div>
								) : (
									<span className="text-sm font-medium text-white/90">
										{balance !== null ? balance.toLocaleString('ru-RU') : '—'}
									</span>
								)}
							</div>

							{/* Block 2: Profile */}
							<Link
								href="/profile"
								className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 lg:gap-3 rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02] relative group/profile"
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

								{/* Username - скрыт на md, виден на lg+ */}
								<span className="hidden lg:inline text-sm font-medium text-white/90">
									{user.username}
								</span>
								{/* Level Badge in Header */}
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
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
								className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-3 lg:px-4 shadow-lg transition-all hover:scale-[1.02] hover:bg-red-500/80 hover:cursor-pointer"
								title="Выйти"
							>
								<svg
									className="h-5 w-5 lg:h-7 lg:w-7 text-white/80"
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
							className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-4 lg:px-6 shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/20"
						>
							<span className="text-sm font-medium text-white/90">Вход</span>
						</Link>
					)}

					{/* Block 4: API Status Indicator */}
					<div className="glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 items-center justify-center rounded-2xl px-3 lg:px-6 shadow-lg transition-transform">
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

				{/* Mobile Menu Button - видна только на мобильных */}
				<button
					ref={mobileMenuButtonRef}
					onClick={(e) => {
						e.stopPropagation();
						setIsMobileMenuOpen(!isMobileMenuOpen);
					}}
					className="md:hidden glass bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
					aria-label="Меню"
				>
					{isMobileMenuOpen ? (
						<svg
							className="h-6 w-6 text-white/90"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					) : (
						<svg
							className="h-6 w-6 text-white/90"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					)}
				</button>
			</div>

			{/* Mobile Dropdown Menu */}
			{isMobileMenuOpen && (
				<div
					ref={mobileMenuRef}
					className="md:hidden absolute top-full left-0 right-0 mt-2 mx-3 glass bg-[var(--color-secondary)]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200"
				>
					<div className="p-4 space-y-2">
						{/* Navigation Links */}
						<Link
							href="/servers"
							onClick={handleLinkClick}
							className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
						>
							<svg
								className="h-5 w-5 text-white/90"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
								/>
							</svg>
							<span className="text-sm font-medium text-white/90">Сервера</span>
						</Link>
						<Link
							href="/stats"
							onClick={handleLinkClick}
							className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
						>
							<svg
								className="h-5 w-5 text-white/90"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<span className="text-sm font-medium text-white/90">Статистика</span>
						</Link>
						<Link
							href="/shop"
							onClick={handleLinkClick}
							className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
						>
							<svg
								className="h-5 w-5 text-white/90"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
								/>
							</svg>
							<span className="text-sm font-medium text-white/90">Магазин</span>
						</Link>

						{/* Admin Link */}
						{user && (user.is_admin || user.is_super_admin) && (
							<Link
								href="/admin"
								onClick={handleLinkClick}
								className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
							>
								<svg
									className="h-5 w-5 text-white/90"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
								<span className="text-sm font-medium text-white/90">Админ</span>
							</Link>
						)}

						{/* Divider */}
						{(user || !isAuthenticated) && <div className="h-px bg-white/10 my-2"></div>}

						{/* Balance */}
						{user && (
							<div className="flex items-center gap-3 px-4 py-3 rounded-xl">
								<svg
									className="h-5 w-5 text-white/90"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span className="text-sm font-medium text-white/90">Баланс:</span>
								{isBalanceLoading ? (
									<div className="h-4 w-16 animate-pulse bg-white/20 rounded"></div>
								) : (
									<span className="text-sm font-bold text-white/90">
										{balance !== null ? balance.toLocaleString('ru-RU') : '—'}
									</span>
								)}
							</div>
						)}

						{/* Profile */}
						{user && (
							<Link
								href="/profile"
								onClick={handleLinkClick}
								className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
								style={
									{
										'--progress-percent': `${(currentXp / nextLevelXp) * 100}%`,
									} as React.CSSProperties
								}
							>
								<div className="h-10 w-10 overflow-hidden rounded-md bg-gradient-to-br from-primary to-secondary">
									{user.avatar ? (
										<Image
											src={user.avatar}
											alt={user.username}
											className="h-full w-full object-cover"
											width={40}
											height={40}
											unoptimized
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
											{user.username.substring(0, 2).toUpperCase()}
										</div>
									)}
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-white/90">{user.username}</span>
										{user.selected_badge_id && (
											<UserBadgeDisplay badgeId={user.selected_badge_id} size="sm" />
										)}
									</div>
									<div className="text-xs text-white/60">Уровень {level}</div>
								</div>
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
									{level}
								</span>
							</Link>
						)}

						{/* Login Link */}
						{!isAuthenticated && !isLoading && (
							<Link
								href="/login"
								onClick={handleLinkClick}
								className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
							>
								<svg
									className="h-5 w-5 text-white/90"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
								<span className="text-sm font-medium text-white/90">Вход</span>
							</Link>
						)}

						{/* Logout Button */}
						{user && (
							<button
								onClick={() => {
									setShowLogoutConfirm(true);
									setIsMobileMenuOpen(false);
								}}
								className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors text-left"
							>
								<svg
									className="h-5 w-5 text-red-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								<span className="text-sm font-medium text-red-400">Выйти</span>
							</button>
						)}

						{/* API Status */}
						<div className="flex items-center gap-3 px-4 py-3 rounded-xl">
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
							<span className="text-xs text-white/60">
								API:{' '}
								{apiStatus === 'online'
									? 'Онлайн'
									: apiStatus === 'checking'
										? 'Проверка...'
										: 'Офлайн'}
							</span>
						</div>
					</div>
				</div>
			)}

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
