export interface LinkedAccount {
	platform: string;
	nickname: string;
	external_id: string;
}

export interface ProfileHeader {
	id: string;
	username: string;
	avatar: string;
	level: number;
	xp: number;
	xp_progress: number;
	xp_for_next_level: number;
	progress_percent: number;
	linked_accounts: LinkedAccount[];
}

export interface ProfileBadge {
	id: string;
	name: string;
	image_url: string;
	description: string;
	received_at: string;
}

export interface MinecraftStat {
	uuid: string;
	name: string;
	registered: number;
	current_nickname: string;
	platform: number;
	last_seen: number;
	total_playtime: number;
	total_kills: number;
	total_deaths: number;
	servers_played: string[];
}

export interface GoldSourceStat {
	steam_id: string;
	name: string;
	registered: number;
	total_playtime: number;
	total_kills: number;
	total_deaths: number;
	total_headshots: number;
	servers_played: string[];
}

export interface UserProfileResponse {
	header: ProfileHeader;
	badges: ProfileBadge[];
	minecraft_stats: MinecraftStat[];
	goldsource_stats: GoldSourceStat[];
}

class ProfileService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
	}

	/**
	 * Get public user profile by identifier (username or UUID)
	 */
	async getProfile(identifier: string): Promise<UserProfileResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users/${identifier}/profile`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Пользователь не найден');
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Failed to get user profile:', error);
			throw error;
		}
	}
}

export const profileService = new ProfileService();
