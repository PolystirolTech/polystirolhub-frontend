import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'My Badges - PolystirolHub',
	description: 'My badges collection',
};

export default function MyBadgesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
