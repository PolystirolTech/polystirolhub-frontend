import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Profile - PolystirolHub',
	description: 'User profile',
};

export default function ProfileLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
