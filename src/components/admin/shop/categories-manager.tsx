'use client';

import { useState, useEffect } from 'react';
import { ShopCategory } from '@/types/shop';
import { shopService } from '@/lib/api/shop-service';
import { fileService } from '@/lib/files/file-service';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import Image from 'next/image';

export function CategoriesManager() {
	const [categories, setCategories] = useState<ShopCategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<ShopCategory | null>(null);
	const [formData, setFormData] = useState({ name: '', icon_url: '' });
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const loadCategories = async () => {
		try {
			setIsLoading(true);
			const data = await shopService.getCategories();
			setCategories(data);
		} catch (error) {
			console.error('Failed to load categories:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadCategories();
	}, []);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			const response = await fileService.uploadFile(file);
			setFormData({ ...formData, icon_url: response.url });
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
			if (editingCategory) {
				await shopService.updateCategory(editingCategory.id, formData.name, formData.icon_url);
			} else {
				await shopService.createCategory(formData.name, formData.icon_url);
			}
			setIsModalOpen(false);
			setEditingCategory(null);
			setFormData({ name: '', icon_url: '' });
			loadCategories();
		} catch (error) {
			console.error('Failed to save category:', error);
			alert('Ошибка при сохранении категории');
		}
	};

	const handleEdit = (category: ShopCategory) => {
		setEditingCategory(category);
		setFormData({ name: category.name, icon_url: category.icon_url || '' });
		setIsModalOpen(true);
	};

	const handleDelete = async () => {
		if (!deleteId) return;
		try {
			await shopService.deleteCategory(deleteId);
			setDeleteId(null);
			loadCategories();
		} catch (error) {
			console.error('Failed to delete category:', error);
			alert('Ошибка при удалении категории');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-white">Категории</h2>
				<button
					onClick={() => {
						setEditingCategory(null);
						setFormData({ name: '', icon_url: '' });
						setIsModalOpen(true);
					}}
					className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
				>
					Добавить категорию
				</button>
			</div>

			<div className="glass-card bg-[var(--color-secondary)]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
				<table className="w-full text-left text-sm text-white/60">
					<thead className="bg-white/5 text-white uppercase font-medium">
						<tr>
							<th className="px-6 py-4">Иконка</th>
							<th className="px-6 py-4">Название</th>
							<th className="px-6 py-4 text-right">Действия</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/5">
						{categories.map((category) => (
							<tr key={category.id} className="hover:bg-white/5 transition-colors">
								<td className="px-6 py-4">
									{category.icon_url ? (
										<div className="relative w-8 h-8">
											<Image
												src={category.icon_url}
												alt=""
												fill
												className="object-contain"
												unoptimized
											/>
										</div>
									) : (
										<div className="w-8 h-8 bg-white/10 rounded-full" />
									)}
								</td>
								<td className="px-6 py-4 font-medium text-white">{category.name}</td>
								<td className="px-6 py-4 text-right space-x-2">
									<button
										onClick={() => handleEdit(category)}
										className="text-primary hover:text-primary/80 cursor-pointer"
									>
										Изменить
									</button>
									<button
										onClick={() => setDeleteId(category.id)}
										className="text-red-400 hover:text-red-300 cursor-pointer"
									>
										Удалить
									</button>
								</td>
							</tr>
						))}
						{categories.length === 0 && !isLoading && (
							<tr>
								<td colSpan={3} className="px-6 py-8 text-center text-white/40">
									Категорий пока нет
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setIsModalOpen(false)}
					/>
					<div className="relative glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-6 rounded-xl w-full max-w-md shadow-2xl">
						<h3 className="text-xl font-bold text-white mb-4">
							{editingCategory ? 'Редактировать категорию' : 'Новая категория'}
						</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
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
								<label className="block text-sm font-medium text-white/60 mb-1">Иконка</label>
								<div className="flex gap-4 items-center">
									<div className="w-12 h-12 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
										{formData.icon_url ? (
											<Image
												src={formData.icon_url}
												alt=""
												fill
												className="object-contain p-2"
												unoptimized
											/>
										) : (
											<span className="text-xs text-white/20">Нет</span>
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
			)}

			<ConfirmationModal
				isOpen={!!deleteId}
				onClose={() => setDeleteId(null)}
				onConfirm={handleDelete}
				title="Удаление категории"
				message="Вы уверены? Это действие нельзя отменить."
				confirmText="Удалить"
				isDangerous
			/>
		</div>
	);
}
