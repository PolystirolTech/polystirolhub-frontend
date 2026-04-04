import { Metadata } from 'next';
import { profileService } from '@/lib/api/profile-service';
import { ProfileClient } from './profile-client';

interface Props {
	params: Promise<{ nickname: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { nickname } = await params;
	const decodedNickname = decodeURIComponent(nickname);

	try {
		const profile = await profileService.getProfile(decodedNickname);
		const title = `${profile.header.username}`;
		const description = `Профиль пользователя ${profile.header.username} на PolystirolHub. Уровень ${profile.header.level}, XP: ${profile.header.xp}.`;

		return {
			title,
			description,
			openGraph: {
				title: `${title} | PolystirolHub`,
				description,
				images: profile.header.avatar ? [profile.header.avatar] : [],
				type: 'profile',
				username: profile.header.username,
			},
			twitter: {
				card: 'summary',
				title: `${title} | PolystirolHub`,
				description,
				images: profile.header.avatar ? [profile.header.avatar] : [],
			},
		};
	} catch (error) {
		return {
			title: 'Профиль не найден',
			description: 'Запрошенный профиль пользователя не найден.',
		};
	}
}

export default async function PublicProfilePage({ params }: Props) {
	const { nickname } = await params;
	return <ProfileClient nickname={nickname} />;
}
