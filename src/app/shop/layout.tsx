import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Магазин',
	description:
		'Покупка игровых предметов, привилегий и внутриигровой валюты сообщества Polystirol.',
};

export default function ShopLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
