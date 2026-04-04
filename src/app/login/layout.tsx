import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Вход',
	description:
		'Войдите в PolystirolHub через Twitch, Discord или Steam, чтобы получить доступ к своему профилю и статистике.',
};

export default function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
