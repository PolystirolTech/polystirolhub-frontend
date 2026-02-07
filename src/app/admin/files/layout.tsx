import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'File Manager - PolystirolHub',
	description: 'Manage server files',
};

export default function FilesAdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
