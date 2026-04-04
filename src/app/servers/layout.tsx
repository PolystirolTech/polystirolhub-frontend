import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Серверы',
	description: 'Список игровых серверов сообщества Polystirol. Подключайтесь и играйте!',
};

export default function ServersLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
