import {
	ShopCategory,
	ShopItem,
	CreateShopItemRequest,
	UpdateShopItemRequest,
	PurchaseRequest,
	ShopOrder,
} from '@/types/shop';

class ShopService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
	}

	private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
		}

		return response.json();
	}

	// Public Methods

	async getCategories(): Promise<ShopCategory[]> {
		return this.fetch<ShopCategory[]>('/api/v1/shop/categories');
	}

	async getItems(serverId?: string): Promise<ShopItem[]> {
		const query = serverId ? `?server_id=${serverId}` : '';
		return this.fetch<ShopItem[]>(`/api/v1/shop/items${query}`);
	}

	async buyItem(data: PurchaseRequest): Promise<void> {
		await this.fetch('/api/v1/shop/buy', {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include', // Important for auth
		});
	}

	async getMyOrders(): Promise<ShopOrder[]> {
		return this.fetch<ShopOrder[]>('/api/v1/shop/orders/me', {
			credentials: 'include',
		});
	}

	// Admin Methods

	async createCategory(name: string, iconUrl?: string): Promise<ShopCategory> {
		return this.fetch<ShopCategory>('/api/v1/shop/categories', {
			method: 'POST',
			body: JSON.stringify({ name, icon_url: iconUrl }),
			credentials: 'include',
		});
	}

	async updateCategory(id: string, name: string, iconUrl?: string): Promise<ShopCategory> {
		return this.fetch<ShopCategory>(`/api/v1/shop/categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ name, icon_url: iconUrl }),
			credentials: 'include',
		});
	}

	async deleteCategory(id: string): Promise<void> {
		await this.fetch(`/api/v1/shop/categories/${id}`, {
			method: 'DELETE',
			credentials: 'include',
		});
	}

	async createItem(data: CreateShopItemRequest): Promise<ShopItem> {
		return this.fetch<ShopItem>('/api/v1/shop/items', {
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include',
		});
	}

	async updateItem(id: string, data: UpdateShopItemRequest): Promise<ShopItem> {
		return this.fetch<ShopItem>(`/api/v1/shop/items/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
			credentials: 'include',
		});
	}

	async deleteItem(id: string): Promise<void> {
		await this.fetch(`/api/v1/shop/items/${id}`, {
			method: 'DELETE',
			credentials: 'include',
		});
	}

	async getAdminOrders(limit: number = 50, offset: number = 0): Promise<ShopOrder[]> {
		return this.fetch<ShopOrder[]>(`/api/v1/shop/orders?limit=${limit}&offset=${offset}`, {
			credentials: 'include',
		});
	}
}

export const shopService = new ShopService();
