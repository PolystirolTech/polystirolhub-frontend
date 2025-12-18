import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LevelProvider } from '@/lib/level/level-context';
import { MaintenanceGuard } from '@/components/maintenance/maintenance-guard';
import { ChristmasDecorations } from '@/components/decorations/christmas-decorations';
import { ENABLE_CHRISTMAS_THEME } from '@/lib/theme/config';

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
		<html lang="en">
			<body className={`${pixelFont.variable} antialiased font-pixel`}>
				{ENABLE_CHRISTMAS_THEME && <ChristmasDecorations />}
				<AuthProvider>
					<LevelProvider>
						<MaintenanceGuard>{children}</MaintenanceGuard>
					</LevelProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
