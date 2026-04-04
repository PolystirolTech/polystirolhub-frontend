import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Достижения',
	description: 'Коллекция значков и достижений сообщества Polystirol.',
};

export default function BadgesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
