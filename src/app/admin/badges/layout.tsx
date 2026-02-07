import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Badges Management - PolystirolHub',
	description: 'Manage badges',
};

export default function BadgesAdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
