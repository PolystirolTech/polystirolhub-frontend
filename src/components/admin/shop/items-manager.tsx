'use client';

import { useState, useEffect } from 'react';
import { ShopItem, CreateShopItemRequest, ShopCategory } from '@/types/shop';
import { shopService } from '@/lib/api/shop-service';
import { gameService } from '@/lib/game/game-service';
import { fileService } from '@/lib/files/file-service';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { GameServerPublic } from '@/lib/api/generated';
import Image from 'next/image';

interface GameType {
	id: string;
	name: string;
}

export function ItemsManager() {
	const [items, setItems] = useState<ShopItem[]>([]);
	const [servers, setServers] = useState<GameServerPublic[]>([]);
	const [gameTypes, setGameTypes] = useState<GameType[]>([]);
	const [categories, setCategories] = useState<ShopCategory[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const [formData, setFormData] = useState<CreateShopItemRequest>({
		name: '',
		description: '',
		price: 0,
		image_url: '',
		category_id: undefined,
		command: '',
		required_platform: null,
		game_type_ids: [],
		game_server_ids: [],
	});

	const loadData = async () => {
		try {
			const [itemsData, serversData, typesData, categoriesData] = await Promise.all([
				shopService.getItems(),
				gameService.getGameServers(),
				gameService.getGameTypes(),
				shopService.getCategories(),
			]);
			setItems(itemsData);
			setServers(serversData);
			setGameTypes(typesData);
			setCategories(categoriesData);
		} catch (error) {
			console.error('Failed to load data:', error);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			const response = await fileService.uploadFile(file);
			setFormData({ ...formData, image_url: response.url });
		} catch (error) {
			console.error('Upload failed:', error);
			alert('Ошибка загрузки файла');
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingItem) {
				await shopService.updateItem(editingItem.id, formData);
			} else {
				await shopService.createItem(formData);
			}
			setIsModalOpen(false);
			setEditingItem(null);
			resetForm();
			loadData();
		} catch (error) {
			console.error('Failed to save item:', error);
			alert('Ошибка при сохранении товара');
		}
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			price: 0,
			image_url: '',
			category_id: undefined,
			command: '',
			required_platform: null,
			game_type_ids: [],
			game_server_ids: [],
		});
	};

	const handleEdit = (item: ShopItem) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			description: item.description,
			price: item.price,
			image_url: item.image_url,
			category_id: item.category_id,
			command: item.command || '',
			required_platform: item.required_platform,
			game_type_ids: item.game_type_ids || [],
			game_server_ids: item.game_server_ids || [],
		});
		setIsModalOpen(true);
	};

	const handleDelete = async () => {
		if (!deleteId) return;
		try {
			await shopService.deleteItem(deleteId);
			setDeleteId(null);
			loadData();
		} catch (error) {
			console.error('Failed to delete item:', error);
			alert('Ошибка при удалении товара');
		}
	};

	const toggleGameType = (id: string) => {
		const current = formData.game_type_ids;
		if (current.includes(id)) {
			setFormData({ ...formData, game_type_ids: current.filter((i) => i !== id) });
		} else {
			setFormData({ ...formData, game_type_ids: [...current, id] });
		}
	};

	const toggleGameServer = (id: string) => {
		const current = formData.game_server_ids;
		if (current.includes(id)) {
			setFormData({ ...formData, game_server_ids: current.filter((i) => i !== id) });
		} else {
			setFormData({ ...formData, game_server_ids: [...current, id] });
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-white">Товары</h2>
				<button
					onClick={() => {
						setEditingItem(null);
						resetForm();
						setIsModalOpen(true);
					}}
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
				>
					Добавить товар
				</button>
			</div>

			<div className="glass-card bg-[var(--color-secondary)]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
				<table className="w-full text-left text-sm text-white/60">
					<thead className="bg-white/5 text-white uppercase font-medium">
						<tr>
							<th className="px-6 py-4">Товар</th>
							<th className="px-6 py-4">Цена</th>
							<th className="px-6 py-4">Платформа</th>
							<th className="px-6 py-4 text-right">Действия</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/5">
						{items.map((item) => (
							<tr key={item.id} className="hover:bg-white/5 transition-colors">
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden flex-shrink-0 relative">
											{item.image_url && (
												<Image
													src={item.image_url}
													alt=""
													fill
													className="object-cover image-pixelated"
													style={{ imageRendering: 'pixelated' }}
													unoptimized
												/>
											)}
										</div>
										<div>
											<div className="font-medium text-white">{item.name}</div>
											<div className="text-xs text-white/40 truncate max-w-[200px]">
												{item.description}
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 font-medium text-white">{item.price}</td>
								<td className="px-6 py-4">
									{item.required_platform ? (
										<span className="px-2 py-1 rounded bg-white/10 text-xs">
											{item.required_platform}
										</span>
									) : (
										<span className="text-white/20">-</span>
									)}
								</td>
								<td className="px-6 py-4 text-right space-x-2">
									<button
										onClick={() => handleEdit(item)}
										className="text-primary hover:text-primary/80 cursor-pointer"
									>
										Изменить
									</button>
									<button
										onClick={() => setDeleteId(item.id)}
										className="text-red-400 hover:text-red-300 cursor-pointer"
									>
										Удалить
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/60 backdrop-blur-sm"
							onClick={() => setIsModalOpen(false)}
						/>
						<div className="relative glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 rounded-xl w-full max-w-2xl shadow-2xl">
							<h3 className="text-xl font-bold text-white mb-6">
								{editingItem ? 'Редактировать товар' : 'Новый товар'}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-white/60 mb-1">Название</label>
										<input
											type="text"
											required
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-white/60 mb-1">Цена</label>
										<input
											type="number"
											required
											min="0"
											value={formData.price}
											onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
											className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-white/60 mb-1">Категория</label>
									<select
										value={formData.category_id || ''}
										onChange={(e) =>
											setFormData({ ...formData, category_id: e.target.value || undefined })
										}
										className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
									>
										<option value="" className="bg-gray-900">
											Без категории
										</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id} className="bg-gray-900">
												{category.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-white/60 mb-1">Описание</label>
									<textarea
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none h-24 resize-none"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-white/60 mb-1">
										Изображение
									</label>
									<div className="flex gap-4 items-center">
										<div className="w-16 h-16 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
											{formData.image_url ? (
												<Image
													src={formData.image_url}
													alt=""
													fill
													className="object-cover image-pixelated"
													style={{ imageRendering: 'pixelated' }}
													unoptimized
												/>
											) : (
												<span className="text-xs text-white/20">Нет фото</span>
											)}
										</div>
										<div className="flex-1">
											<input
												type="file"
												accept="image/*"
												onChange={handleFileUpload}
												className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
											/>
											{uploading && <p className="text-xs text-primary mt-1">Загрузка...</p>}
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-white/60 mb-1">Команда</label>
									<div className="text-xs text-white/40 mb-2 space-y-1">
										<p>Доступные переменные:</p>
										<ul className="list-disc list-inside pl-2">
											<li>
												<code className="text-primary">{`{username}`}</code> - никнейм на сайте
											</li>
											<li>
												<code className="text-primary">{`{steam_id}`}</code> - привязанный Steam ID
											</li>
											<li>
												<code className="text-primary">{`{mc_name}`}</code> - привязанный ник
												Minecraft
											</li>
										</ul>
									</div>
									<input
										type="text"
										value={formData.command}
										onChange={(e) => setFormData({ ...formData, command: e.target.value })}
										className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
										placeholder="give {username} item 1"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-white/60 mb-1">
										Требование платформы
									</label>
									<select
										value={formData.required_platform || ''}
										onChange={(e) =>
											setFormData({
												...formData,
												required_platform: (e.target.value as 'steam' | 'minecraft') || null,
											})
										}
										className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
									>
										<option value="" className="bg-gray-900">
											Нет
										</option>
										<option value="steam" className="bg-gray-900">
											Steam
										</option>
										<option value="minecraft" className="bg-gray-900">
											Minecraft
										</option>
									</select>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-white/60 mb-2">
											Доступно на типах игр
										</label>
										<div className="bg-black/20 border border-white/10 rounded-lg p-2 h-40 overflow-y-auto space-y-1">
											{gameTypes.map((type) => (
												<label
													key={type.id}
													className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors"
												>
													<input
														type="checkbox"
														checked={formData.game_type_ids.includes(type.id)}
														onChange={() => toggleGameType(type.id)}
														className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
													/>
													<span className="text-sm text-white">{type.name}</span>
												</label>
											))}
											{gameTypes.length === 0 && (
												<div className="text-xs text-white/40 text-center py-4">Нет типов игр</div>
											)}
										</div>
									</div>
									<div>
										<label className="block text-sm font-medium text-white/60 mb-2">
											Доступно на серверах
										</label>
										<div className="bg-black/20 border border-white/10 rounded-lg p-2 h-40 overflow-y-auto space-y-1">
											{servers.map((server) => (
												<label
													key={server.id}
													className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors"
												>
													<input
														type="checkbox"
														checked={formData.game_server_ids.includes(server.id)}
														onChange={() => toggleGameServer(server.id)}
														className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary flex-shrink-0"
													/>
													<span className="text-sm text-white break-words">{server.name}</span>
												</label>
											))}
											{servers.length === 0 && (
												<div className="text-xs text-white/40 text-center py-4">Нет серверов</div>
											)}
										</div>
									</div>
								</div>

								<div className="flex justify-end gap-3 mt-6">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
									>
										Отмена
									</button>
									<button
										type="submit"
										className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer"
									>
										Сохранить
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			<ConfirmationModal
				isOpen={!!deleteId}
				onClose={() => setDeleteId(null)}
				onConfirm={handleDelete}
				title="Удаление товара"
				message="Вы уверены? Это действие нельзя отменить."
				confirmText="Удалить"
				isDangerous
			/>
		</div>
	);
}
