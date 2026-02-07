import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LevelProvider } from '@/lib/level/level-context';
import { MaintenanceGuard } from '@/components/maintenance/maintenance-guard';
import { ChristmasDecorations } from '@/components/decorations/christmas-decorations';
import { Analytics } from '@/components/analytics/analytics';
import { ENABLE_CHRISTMAS_THEME } from '@/lib/theme/config';

import { CookieConsent } from '@/components/layout/cookie-consent';
import { BackgroundManager } from '@/components/layout/background-manager';
import { BackgroundProvider } from '@/lib/background/background-context';

const pixelFont = Press_Start_2P({
	variable: '--font-pixel',
	subsets: ['latin', 'cyrillic'],
	weight: '400',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'PolystirolHub',
	description: 'The central hub for Polystirol technologies',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru">
			<body className={`${pixelFont.variable} antialiased font-pixel`}>
				{ENABLE_CHRISTMAS_THEME && <ChristmasDecorations />}
				<Analytics />
				<AuthProvider>
					<BackgroundProvider>
						<BackgroundManager />
						<LevelProvider>
							<MaintenanceGuard>{children}</MaintenanceGuard>
							<CookieConsent />
						</LevelProvider>
					</BackgroundProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
