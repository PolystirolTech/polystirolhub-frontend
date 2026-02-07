/**
 * Whitelist Service
 *
 * Service layer for whitelist API operations: user apply, admin approve/reject, add manually.
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface WhitelistApplyResponse {
	message: string;
	entry_id: string;
	status: string;
}

export interface WhitelistEntry {
	id: string;
	server_id: string;
	user_id: string | null;
	nickname: string;
	status: string;
	created_at: string;
	reviewed_at: string | null;
}

class WhitelistService {
	/**
	 * Apply to whitelist (user, authenticated)
	 * POST /api/v1/game-servers/{server_id}/whitelist/apply
	 */
	async apply(serverId: string, nickname: string): Promise<WhitelistApplyResponse> {
		const response = await fetch(`${baseUrl}/api/v1/game-servers/${serverId}/whitelist/apply`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ nickname }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const detail =
				errorData.detail ||
				errorData.message ||
				`Ошибка ${response.status}: ${response.statusText}`;
			throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
		}

		return response.json();
	}

	/**
	 * Get pending whitelist entries (admin)
	 * GET /api/v1/admin/whitelist/pending?server_id=...
	 */
	async getPending(serverId?: string): Promise<WhitelistEntry[]> {
		const url = serverId
			? `${baseUrl}/api/v1/admin/whitelist/pending?server_id=${encodeURIComponent(serverId)}`
			: `${baseUrl}/api/v1/admin/whitelist/pending`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}

		const data = await response.json();
		return Array.isArray(data) ? data : [];
	}

	/**
	 * Get approved whitelist entries (admin)
	 * GET /api/v1/admin/whitelist/approved?server_id=...
	 */
	async getApproved(serverId?: string): Promise<WhitelistEntry[]> {
		const url = serverId
			? `${baseUrl}/api/v1/admin/whitelist/approved?server_id=${encodeURIComponent(serverId)}`
			: `${baseUrl}/api/v1/admin/whitelist/approved`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}

		const data = await response.json();
		return Array.isArray(data) ? data : [];
	}

	/**
	 * Approve whitelist entry (admin)
	 * POST /api/v1/admin/whitelist/entries/{entry_id}/approve
	 */
	async approve(entryId: string): Promise<void> {
		const response = await fetch(`${baseUrl}/api/v1/admin/whitelist/entries/${entryId}/approve`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}
	}

	/**
	 * Reject whitelist entry (admin)
	 * POST /api/v1/admin/whitelist/entries/{entry_id}/reject
	 */
	async reject(entryId: string): Promise<void> {
		const response = await fetch(`${baseUrl}/api/v1/admin/whitelist/entries/${entryId}/reject`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}
	}

	/**
	 * Delete whitelist entry completely (admin)
	 * DELETE /api/v1/admin/whitelist/entries/{entry_id}
	 */
	async delete(entryId: string): Promise<void> {
		const response = await fetch(`${baseUrl}/api/v1/admin/whitelist/entries/${entryId}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}
	}

	/**
	 * Add nickname to whitelist manually (admin)
	 * POST /api/v1/admin/whitelist/add
	 */
	async addManually(serverId: string, nickname: string, userId?: string): Promise<void> {
		const body: { server_id: string; nickname: string; user_id?: string } = {
			server_id: serverId,
			nickname,
		};
		if (userId) {
			body.user_id = userId;
		}

		const response = await fetch(`${baseUrl}/api/v1/admin/whitelist/add`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}
	}
	/**
	 * Get current user's whitelist status for a server
	 * GET /api/v1/game-servers/{server_id}/whitelist/my-status
	 */
	async getMyStatus(serverId: string): Promise<{ status: string | null }> {
		const response = await fetch(`${baseUrl}/api/v1/game-servers/${serverId}/whitelist/my-status`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			// If 404, it might mean no entry found, but API usually returns null status in 200 OK.
			// If 401, user not authenticated.
			if (response.status === 404) {
				return { status: null };
			}

			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.detail || errorData.message || `Ошибка ${response.status}: ${response.statusText}`
			);
		}

		return response.json();
	}
}

export const whitelistService = new WhitelistService();
