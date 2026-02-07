import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'My Achievements - PolystirolHub',
	description: 'My achievements progress',
};

export default function MyAchievementsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
