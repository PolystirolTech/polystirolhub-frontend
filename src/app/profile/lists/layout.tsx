import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Мои списки - PolystirolHub',
	description: 'Управление списками аниме, фильмов, сериалов и музыки',
};

export default function ListsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
