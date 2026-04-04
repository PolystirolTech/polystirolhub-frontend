import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Статистика',
	description: 'Глобальная статистика игроков, рейтинг и экономика сообщества Polystirol.',
};

export default function StatsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
