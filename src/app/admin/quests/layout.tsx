import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quests Management - PolystirolHub',
	description: 'Manage quests',
};

export default function QuestsAdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
