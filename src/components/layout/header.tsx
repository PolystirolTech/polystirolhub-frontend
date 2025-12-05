import Link from 'next/link';

interface HeaderProps {
    isAuthenticated?: boolean;
}

export function Header({ isAuthenticated = false }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-6">
            <div className="mx-auto flex max-w-5xl items-center justify-start gap-2">
                {/* Block 1: Logo / Project Name */}
                <div className="glass bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 flex h-12 items-center rounded-2xl px-6 shadow-lg transition-transform hover:scale-[1.02]">
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
                    >
                        polystirolhub
                    </Link>
                </div>

                {/* Authenticated User Blocks */}
                {isAuthenticated && (
                    <>
                        {/* Block 2: Profile */}
                        <Link href="/profile" className="glass bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 flex h-12 items-center gap-3 rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02]">
                            {/* Level Badge */}
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-primary/60 bg-primary/10">
                                <span className="text-sm font-bold text-primary">42</span>
                            </div>

                            {/* Avatar */}
                            <div className="h-8 w-8 overflow-hidden rounded-md bg-gradient-to-br from-primary to-secondary">
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                    JD
                                </div>
                            </div>

                            {/* Username */}
                            <span className="text-sm font-medium text-white/90">JohnDoe</span>
                        </Link>

                        {/* Block 3: Logout */}
                        <button className="glass bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-4 shadow-lg transition-all hover:scale-[1.02] hover:bg-red-500/80 hover:cursor-pointer">
                            <svg className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Unauthenticated User Block */}
                {!isAuthenticated && (
                    <Link
                        href="/login"
                        className="glass bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 flex h-12 items-center gap-2 rounded-2xl px-6 shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/20"
                    >
                        <span className="text-sm font-medium text-white/90">Вход</span>
                    </Link>
                )}

                {/* Block 4: API Status Indicator */}
                <div className="glass bg-[var(--color-secondary)]/95 backdrop-blur-md border border-white/10 flex h-12 items-center gap-3 rounded-2xl px-6 shadow-lg transition-transform">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-white/90">API GUCCI</span>
                </div>


            </div>
        </header>
    );
}
