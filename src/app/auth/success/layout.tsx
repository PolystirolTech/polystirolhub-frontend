import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Auth Success - PolystirolHub',
	description: 'Authentication successful',
};

export default function AuthSuccessLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
