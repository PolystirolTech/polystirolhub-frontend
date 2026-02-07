import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Resource Collection - PolystirolHub',
	description: 'Manage resource collection goals',
};

export default function ResourceCollectionAdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
