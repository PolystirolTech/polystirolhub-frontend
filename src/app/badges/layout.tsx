import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Badges - PolystirolHub',
	description: 'Badges catalog',
};

export default function BadgesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
