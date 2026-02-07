import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Auth Error - PolystirolHub',
	description: 'Authentication error',
};

export default function AuthErrorLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
