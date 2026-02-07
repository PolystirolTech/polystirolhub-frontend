'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { whitelistService, type WhitelistEntry } from '@/lib/whitelist/whitelist-service';
import { gameService } from '@/lib/game/game-service';
import type { GameServerResponse } from '@/lib/api/generated';

export function WhitelistAdminWidget() {
	const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
	const [entries, setEntries] = useState<WhitelistEntry[]>([]);
	const [servers, setServers] = useState<GameServerResponse[]>([]);
	const [serverFilter, setServerFilter] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingId, setProcessingId] = useState<string | null>(null);

	// Add manually form
	const [addServerId, setAddServerId] = useState('');
	const [addNickname, setAddNickname] = useState('');
	const [addUserId, setAddUserId] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
		null
	);

	const loadServers = useCallback(async () => {
		try {
			const list = await gameService.getAdminGameServers();
			setServers(list);
		} catch (err) {
			console.error('Failed to load servers:', err);
		}
	}, []);

	const loadEntries = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const list = await (activeTab === 'pending'
				? whitelistService.getPending(serverFilter.trim() || undefined)
				: whitelistService.getApproved(serverFilter.trim() || undefined));
			setEntries(list);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки');
		} finally {
			setIsLoading(false);
		}
	}, [serverFilter, activeTab]);

	useEffect(() => {
		loadServers();
	}, [loadServers]);

	useEffect(() => {
		loadEntries();
	}, [loadEntries]);

	const getServerName = (serverId: string): string => {
		const server = servers.find((s) => String(s.id) === serverId);
		return server?.name || serverId;
	};

	const formatDate = (dateStr: string): string => {
		try {
			const d = new Date(dateStr);
			return d.toLocaleString('ru-RU');
		} catch {
			return dateStr;
		}
	};

	const handleApprove = async (entryId: string) => {
		try {
			setProcessingId(entryId);
			await whitelistService.approve(entryId);
			setEntries((prev) => prev.filter((e) => e.id !== entryId));
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Ошибка при одобрении');
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (entryId: string) => {
		try {
			setProcessingId(entryId);
			await whitelistService.reject(entryId);
			setEntries((prev) => prev.filter((e) => e.id !== entryId));
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Ошибка при отклонении');
		} finally {
			setProcessingId(null);
		}
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm('Вы уверены, что хотите полностью удалить эту запись?')) return;
		try {
			setProcessingId(entryId);
			await whitelistService.delete(entryId);
			setEntries((prev) => prev.filter((e) => e.id !== entryId));
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Ошибка при удалении');
		} finally {
			setProcessingId(null);
		}
	};

	const handleAddManually = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedNick = addNickname.trim();
		if (!addServerId.trim()) {
			setAddMessage({ type: 'error', text: 'Выберите сервер' });
			return;
		}
		if (!trimmedNick) {
			setAddMessage({ type: 'error', text: 'Введите ник' });
			return;
		}

		setIsAdding(true);
		setAddMessage(null);

		try {
			await whitelistService.addManually(
				addServerId.trim(),
				trimmedNick,
				addUserId.trim() || undefined
			);
			setAddMessage({ type: 'success', text: 'Ник успешно добавлен в вайтлист' });
			setAddNickname('');
			setAddUserId('');
		} catch (err) {
			setAddMessage({
				type: 'error',
				text: err instanceof Error ? err.message : 'Ошибка при добавлении',
			});
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Список заявок */}
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-bold text-white">Управление вайтлистом</h3>
					<div className="flex gap-2">
						<Button
							variant={activeTab === 'pending' ? 'default' : 'secondary'}
							size="sm"
							onClick={() => setActiveTab('pending')}
							className={activeTab === 'pending' ? 'bg-primary' : ''}
						>
							Заявки (pending)
						</Button>
						<Button
							variant={activeTab === 'approved' ? 'default' : 'secondary'}
							size="sm"
							onClick={() => setActiveTab('approved')}
							className={activeTab === 'approved' ? 'bg-primary' : ''}
						>
							Одобренные
						</Button>
					</div>
				</div>

				{/* Фильтр по серверу */}
				<div className="mb-4">
					<label className="text-xs font-medium text-white/80">Сервер:</label>
					<select
						value={serverFilter}
						onChange={(e) => setServerFilter(e.target.value)}
						className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
					>
						<option value="">Все серверы</option>
						{servers.map((s) => (
							<option key={String(s.id)} value={String(s.id)}>
								{s.name || s.id}
							</option>
						))}
					</select>
				</div>

				<Button
					onClick={loadEntries}
					variant="secondary"
					size="sm"
					disabled={isLoading}
					className="mb-4"
				>
					{isLoading ? 'Загрузка...' : 'Обновить'}
				</Button>

				{error && (
					<div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
						{error}
					</div>
				)}

				{entries.length === 0 ? (
					<p className="text-sm text-white/60">
						Нет {activeTab === 'pending' ? 'pending заявок' : 'одобренных записей'}
					</p>
				) : (
					<div className="space-y-3">
						{entries.map((entry) => (
							<div
								key={entry.id}
								className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 p-3 border border-white/10"
							>
								<div className="min-w-0">
									<p className="text-sm font-medium text-white truncate">
										Сервер: {getServerName(entry.server_id)}
									</p>
									<p className="text-xs text-white/70">Ник: {entry.nickname}</p>
									<p className="text-xs text-white/50">
										{formatDate(entry.created_at)}
										{entry.user_id && ` • user_id: ${entry.user_id}`}
									</p>
								</div>
								<div className="flex gap-2 shrink-0">
									{activeTab === 'pending' ? (
										<>
											<Button
												variant="default"
												size="sm"
												onClick={() => handleApprove(entry.id)}
												disabled={processingId === entry.id}
												className="bg-green-600 hover:bg-green-700 text-white text-xs"
											>
												Принять
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleReject(entry.id)}
												disabled={processingId === entry.id}
												className="text-xs"
											>
												Отклонить
											</Button>
										</>
									) : (
										<>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleReject(entry.id)}
												disabled={processingId === entry.id}
												className="text-xs bg-orange-600 hover:bg-orange-700"
												title="Отозвать доступ (сделать rejected)"
											>
												Отозвать
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={() => handleDelete(entry.id)}
												disabled={processingId === entry.id}
												className="text-xs bg-red-900/50 hover:bg-red-900/70 text-red-200"
												title="Полностью удалить запись из БД"
											>
												Удалить
											</Button>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Добавить вручную */}
			<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4">
				<h3 className="mb-4 text-sm font-bold text-white">Добавить в вайтлист вручную</h3>

				<form onSubmit={handleAddManually} className="space-y-4">
					<div>
						<label className="text-xs font-medium text-white">Сервер *</label>
						<select
							value={addServerId}
							onChange={(e) => setAddServerId(e.target.value)}
							required
							className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
						>
							<option value="">Выберите сервер</option>
							{servers.map((s) => (
								<option key={String(s.id)} value={String(s.id)}>
									{s.name || s.id}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="text-xs font-medium text-white">Ник *</label>
						<Input
							type="text"
							value={addNickname}
							onChange={(e) => setAddNickname(e.target.value)}
							placeholder="Steve"
							className="bg-black/20 border-white/10 text-white mt-1"
							required
						/>
					</div>

					<div>
						<label className="text-xs font-medium text-white/80">User ID (опционально)</label>
						<Input
							type="text"
							value={addUserId}
							onChange={(e) => setAddUserId(e.target.value)}
							placeholder="UUID пользователя"
							className="bg-black/20 border-white/10 text-white mt-1"
						/>
					</div>

					{addMessage && (
						<div
							className={`p-2 rounded text-xs ${
								addMessage.type === 'success'
									? 'bg-green-500/10 text-green-400'
									: 'bg-red-500/10 text-red-400'
							}`}
						>
							{addMessage.text}
						</div>
					)}

					<Button
						type="submit"
						disabled={isAdding}
						className="bg-primary hover:bg-primary/90 text-white"
					>
						{isAdding ? 'Добавление...' : 'Добавить'}
					</Button>
				</form>
			</div>
		</div>
	);
}
