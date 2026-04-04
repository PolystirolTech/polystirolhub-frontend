import type { Metadata } from 'next';
import { Press_Start_2P, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LevelProvider } from '@/lib/level/level-context';
import { BalanceProvider } from '@/lib/balance-context';
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

const japaneseFont = Noto_Sans_JP({
	variable: '--font-japanese',
	weight: ['400', '700'],
	display: 'swap',
});

export const metadata: Metadata = {
	metadataBase: new URL('https://polystirol-hub.ru'),
	title: {
		default: 'PolystirolHub',
		template: '%s | PolystirolHub',
	},
	description: 'The central hub for Polystirol technologies, game servers, and community stats.',
	keywords: ['polystirol', 'gaming hub', 'servers', 'stats', 'badges', 'minecraft', 'goldsource'],
	authors: [{ name: 'Polystirol Team' }],
	openGraph: {
		title: 'PolystirolHub',
		description: 'The central hub for Polystirol technologies',
		url: 'https://polystirol-hub.ru',
		siteName: 'PolystirolHub',
		locale: 'ru_RU',
		type: 'website',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'PolystirolHub Preview',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'PolystirolHub',
		description: 'The central hub for Polystirol technologies',
		images: ['/og-image.png'],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru">
			<body className={`${pixelFont.variable} ${japaneseFont.variable} antialiased font-pixel`}>
				{ENABLE_CHRISTMAS_THEME && <ChristmasDecorations />}
				<Analytics />
				<AuthProvider>
					<BackgroundProvider>
						<BackgroundManager />
						<LevelProvider>
							<BalanceProvider>
								<MaintenanceGuard>{children}</MaintenanceGuard>
								<CookieConsent />
							</BalanceProvider>
						</LevelProvider>
					</BackgroundProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
