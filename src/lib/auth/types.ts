/**
 * Authentication Types
 *
 * Type definitions for user authentication and OAuth providers.
 */

export type OAuthProvider = 'twitch' | 'discord' | 'steam';

export interface User {
	id: number;
	email: string | null;
	username: string;
	avatar: string | null;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface UpdateProfileData {
	email?: string;
	username?: string;
	avatar?: string;
	is_active?: boolean;
}

export interface OAuthAccount {
	id: number;
	user_id: number;
	provider: OAuthProvider;
	provider_account_id: string;
	access_token: string;
	refresh_token: string | null;
	expires_at: number | null;
	created_at: string;
	updated_at: string;
}

export interface ProviderConnection {
	provider: string;
	provider_username: string;
	provider_avatar: string;
	created_at: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

export interface AuthContextType extends AuthState {
	login: (provider: OAuthProvider) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}
