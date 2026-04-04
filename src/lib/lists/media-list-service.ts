import { apiConfig } from '@/lib/api/config';
import type {
	MediaListItem,
	MediaListStats,
	CreateCustomMediaListItem,
	CreateMediaListItem,
	UpdateMediaListItem,
	GetMediaListParams,
	MediaType,
	SearchResult,
} from './types';

const BASE = () => `${apiConfig.basePath || 'http://localhost:8000'}/api/v1/media-list`;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(url, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (!response.ok) {
		console.warn(`[MediaListService] ${response.status} ${url}:`, response.statusText);
		const error = await response.json().catch(() => ({}));
		const message = error.detail || error.message || `Ошибка ${response.status}`;
		const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
		(err as Error & { status: number }).status = response.status;
		throw err;
	}

	if (response.status === 204) return undefined as T;
	return response.json();
}

class MediaListService {
	async getMyList(params: GetMediaListParams = {}): Promise<MediaListItem[]> {
		const query = new URLSearchParams();
		if (params.media_type) query.set('media_type', params.media_type);
		if (params.status) query.set('status', params.status);
		if (params.is_favorite !== undefined) query.set('is_favorite', String(params.is_favorite));
		if (params.sort_by) query.set('sort_by', params.sort_by);
		if (params.order) query.set('order', params.order);
		if (params.limit !== undefined) query.set('limit', String(params.limit));
		if (params.offset !== undefined) query.set('offset', String(params.offset));
		if (params.q) query.set('q', params.q);

		const qs = query.toString();
		return request<MediaListItem[]>(`${BASE()}${qs ? `?${qs}` : ''}`);
	}

	async getStats(mediaType?: MediaType): Promise<MediaListStats> {
		const query = new URLSearchParams();
		if (mediaType) query.set('media_type', mediaType);
		const qs = query.toString();
		return request<MediaListStats>(`${BASE()}/stats${qs ? `?${qs}` : ''}`);
	}

	async getItem(id: string): Promise<MediaListItem> {
		return request<MediaListItem>(`${BASE()}/${id}`);
	}

	async createItem(data: CreateMediaListItem): Promise<MediaListItem> {
		return request<MediaListItem>(BASE(), {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async createCustomItem(data: CreateCustomMediaListItem): Promise<MediaListItem> {
		return request<MediaListItem>(`${BASE()}/custom`, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateItem(id: string, data: UpdateMediaListItem): Promise<MediaListItem> {
		return request<MediaListItem>(`${BASE()}/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}

	async deleteItem(id: string): Promise<void> {
		return request<void>(`${BASE()}/${id}`, { method: 'DELETE' });
	}

	async toggleFavorite(id: string): Promise<MediaListItem> {
		return request<MediaListItem>(`${BASE()}/${id}/favorite`, { method: 'POST' });
	}

	async getPublicStats(username: string, mediaType?: MediaType): Promise<MediaListStats> {
		const query = new URLSearchParams();
		if (mediaType) query.set('media_type', mediaType);
		const qs = query.toString();
		return request<MediaListStats>(
			`${BASE()}/users/${encodeURIComponent(username)}/stats${qs ? `?${qs}` : ''}`
		);
	}

	async getPublicList(username: string, params: GetMediaListParams = {}): Promise<MediaListItem[]> {
		const query = new URLSearchParams();
		if (params.media_type) query.set('media_type', params.media_type);
		if (params.status) query.set('status', params.status);
		if (params.is_favorite !== undefined) query.set('is_favorite', String(params.is_favorite));
		if (params.sort_by) query.set('sort_by', params.sort_by);
		if (params.order) query.set('order', params.order);
		if (params.limit !== undefined) query.set('limit', String(params.limit));
		if (params.offset !== undefined) query.set('offset', String(params.offset));
		if (params.q) query.set('q', params.q);

		const qs = query.toString();
		return request<MediaListItem[]>(
			`${BASE()}/users/${encodeURIComponent(username)}${qs ? `?${qs}` : ''}`
		);
	}

	async search(query: string, type: MediaType): Promise<SearchResult[]> {
		const qs = new URLSearchParams({
			q: query,
			type,
		}).toString();
		return request<SearchResult[]>(`${BASE()}/search?${qs}`);
	}

	async exportAnime(): Promise<Blob> {
		const response = await fetch(`${BASE()}/anime/export`, {
			credentials: 'include',
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || `Ошибка ${response.status}`);
		}
		return response.blob();
	}

	async importAnime(file: File): Promise<ImportResult> {
		return this._importMultipart(`${BASE()}/anime/import`, file);
	}

	async importLetterboxd(file: File): Promise<ImportResult> {
		return this._importMultipart(`${BASE()}/import/letterboxd`, file);
	}

	async importImdbRatings(file: File): Promise<ImportResult> {
		return this._importMultipart(`${BASE()}/import/imdb/ratings`, file);
	}

	async importImdbWatchlist(file: File): Promise<ImportResult> {
		return this._importMultipart(`${BASE()}/import/imdb/watchlist`, file);
	}

	private async _importMultipart(url: string, file: File): Promise<ImportResult> {
		const formData = new FormData();
		formData.append('file', file);
		const response = await fetch(url, {
			method: 'POST',
			credentials: 'include',
			body: formData,
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || `Ошибка ${response.status}`);
		}
		return response.json();
	}
}

export type ImportResult = { imported: number; skipped: number; errors: string[] };

export const mediaListService = new MediaListService();
