import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Servers - PolystirolHub',
	description: 'Game servers list',
};

export default function ServersLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
