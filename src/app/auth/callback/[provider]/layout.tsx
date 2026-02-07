import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Auth Callback - PolystirolHub',
	description: 'Authentication callback',
};

export default function AuthCallbackLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
