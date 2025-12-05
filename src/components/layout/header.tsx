import Link from 'next/link';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4">
            <div className="glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-6 shadow-lg">
                {/* Logo / Project Name */}
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
                >
                    polystirolhub
                </Link>

                {/* API Status Indicator */}
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    <span>API Online</span>
                </div>
            </div>
        </header>
    );
}
