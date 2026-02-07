import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Statistics - PolystirolHub',
	description: 'Player and server statistics',
};

export default function StatsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
