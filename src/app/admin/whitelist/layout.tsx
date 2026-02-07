import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Whitelist Management - PolystirolHub',
	description: 'Manage whitelist applications',
};

export default function WhitelistAdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
