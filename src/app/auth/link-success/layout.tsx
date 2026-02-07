import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Link Success - PolystirolHub',
	description: 'Account linking successful',
};

export default function LinkSuccessLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
