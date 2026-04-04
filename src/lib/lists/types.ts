export type MediaType = 'anime' | 'movie' | 'game' | 'album' | 'series';
export type MediaStatus = 'planned' | 'in_progress' | 'completed' | 'dropped';
export type SortBy = 'created_at' | 'updated_at' | 'rating' | 'completed_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface MediaListItem {
	id: string;
	user_id: string;
	media_type: MediaType;
	title: string;
	cover_url: string | null;
	external_id: string | null;
	status: MediaStatus | null;
	rating: number | null;
	comment: string | null;
	is_favorite: boolean;
	is_public: boolean;
	started_at: string | null;
	completed_at: string | null;
	play_time_hours: number | null;
	created_at: string;
	updated_at: string;
}

export interface SearchResult {
	title: string;
	cover_url: string;
	external_id: string;
	description?: string;
	genres?: string[];
	source_rating?: number;
	year?: number;
}

export interface CreateMediaListItem {
	media_type: MediaType;
	external_id: string;
	status?: MediaStatus | null;
	rating?: number | null;
	comment?: string | null;
	is_favorite?: boolean;
	is_public?: boolean;
	started_at?: string | null;
	completed_at?: string | null;
	play_time_hours?: number | null;
}

export interface UpdateMediaListItem {
	status?: MediaStatus | null;
	rating?: number | null;
	comment?: string | null;
	is_favorite?: boolean;
	is_public?: boolean;
	started_at?: string | null;
	completed_at?: string | null;
	play_time_hours?: number | null;
}

export interface GetMediaListParams {
	media_type?: MediaType;
	status?: MediaStatus;
	is_favorite?: boolean;
	sort_by?: SortBy;
	order?: SortOrder;
	limit?: number;
	offset?: number;
}
