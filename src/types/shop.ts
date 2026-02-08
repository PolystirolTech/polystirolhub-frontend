export interface ShopCategory {
	id: string;
	name: string;
	icon_url?: string;
}

export interface ShopItem {
	id: string;
	name: string;
	description: string;
	price: number;
	image_url: string;
	category_id?: string;
	required_platform: 'steam' | 'minecraft' | null;
	command?: string; // Admin only usually, but good to have in type if needed
	game_type_ids?: string[];
	game_server_ids?: string[];
}

export interface CreateShopItemRequest {
	name: string;
	description?: string;
	price: number;
	image_url: string;
	category_id?: string;
	command: string;
	required_platform: 'steam' | 'minecraft' | null;
	game_type_ids: string[];
	game_server_ids: string[];
}

export type UpdateShopItemRequest = Partial<CreateShopItemRequest>;

export interface PurchaseRequest {
	item_id: string;
	game_server_id: string;
}

export interface GameServer {
	id: string;
	name: string;
	game_type?: string;
	// Add other fields as necessary based on existing server types
}

export interface ShopOrder {
	id: string;
	user_id: string;
	item_id: string;
	game_server_id: string;
	price_paid: number;
	status: string;
	created_at: string;
	delivered_at?: string;
}
