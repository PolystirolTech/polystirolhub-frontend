'use client';

import { useEffect, useState, useRef } from 'react';
import { minecraftStatsService } from '@/lib/stats/minecraft/minecraft-stats-service';
import type { MinecraftKillResponse } from '@/lib/api/generated/models';
import { formatTimestamp } from '@/lib/utils/stats-formatters';
import { StatsLoading } from '@/components/stats/common/stats-loading';
import { StatsError } from '@/components/stats/common/stats-error';
import { StatsEmpty } from '@/components/stats/common/stats-empty';
import { StatsSection } from '@/components/stats/common/stats-section';

interface MinecraftKillsListProps {
	playerUuid: string;
	serverId?: string | number;
}

const PAGE_SIZE = 5;

export function MinecraftKillsList({ playerUuid, serverId }: MinecraftKillsListProps) {
	const [kills, setKills] = useState<MinecraftKillResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [playerNamesCache, setPlayerNamesCache] = useState<Map<string, string>>(new Map());
	const loadingUuidsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		async function loadKills() {
			try {
				setLoading(true);
				setError(null);
				const offset = (page - 1) * PAGE_SIZE;
				const data = await minecraftStatsService.getPlayerKills(
					playerUuid,
					PAGE_SIZE,
					offset,
					serverId
				);
				setKills(data);
				setHasMore(data.length === PAGE_SIZE);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить убийства');
			} finally {
				setLoading(false);
			}
		}

		if (playerUuid) {
			loadKills();
		}
	}, [playerUuid, page, serverId]);

	// Загрузка профилей для жертв без имени
	useEffect(() => {
		async function loadPlayerNames() {
			if (kills.length === 0) return;

			const getStringValue = (obj: unknown): string | null => {
				const getValue = (obj: unknown): unknown => {
					if (obj === null || obj === undefined) return null;
					if (typeof obj === 'string' || typeof obj === 'number') return obj;
					if (obj && typeof obj === 'object' && 'value' in obj)
						return (obj as { value: unknown }).value;
					return null;
				};
				const value = getValue(obj);
				return value !== null ? String(value) : null;
			};

			// Собираем UUID жертв без имени
			const victimUuidsToLoad = new Set<string>();
			kills.forEach((kill) => {
				const victimName = getStringValue(kill.victimName);
				const victimUuid = getStringValue(kill.victimUuid);
				if (
					!victimName &&
					victimUuid &&
					!playerNamesCache.has(victimUuid) &&
					!loadingUuidsRef.current.has(victimUuid)
				) {
					victimUuidsToLoad.add(victimUuid);
					loadingUuidsRef.current.add(victimUuid);
				}
			});

			if (victimUuidsToLoad.size === 0) return;

			// Загружаем профили параллельно
			const loadPromises = Array.from(victimUuidsToLoad).map(async (uuid) => {
				try {
					const profile = await minecraftStatsService.getPlayerProfile(uuid);
					if (profile && profile.name) {
						const name = typeof profile.name === 'string' ? profile.name : null;
						return { uuid, name };
					}
				} catch {
					// Игнорируем ошибки загрузки профиля (404 и т.д.)
				} finally {
					loadingUuidsRef.current.delete(uuid);
				}
				return { uuid, name: null };
			});

			const results = await Promise.all(loadPromises);

			// Обновляем кеш только с новыми именами
			setPlayerNamesCache((prevCache) => {
				const newCache = new Map(prevCache);
				results.forEach(({ uuid, name }) => {
					if (name) {
						newCache.set(uuid, name);
					}
				});
				return newCache;
			});
		}

		loadPlayerNames();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [kills]);

	const getValue = (obj: unknown): unknown => {
		if (obj === null || obj === undefined) return null;
		if (typeof obj === 'string' || typeof obj === 'number') return obj;
		if (obj && typeof obj === 'object' && 'value' in obj) return (obj as { value: unknown }).value;
		return null;
	};

	const getStringValue = (obj: unknown): string | null => {
		const value = getValue(obj);
		return value !== null ? String(value) : null;
	};

	// Форматирует название оружия в читаемый вид
	const formatWeaponName = (weaponId: string): string => {
		if (!weaponId || typeof weaponId !== 'string') return 'Неизвестно';

		// Убираем префикс мода (например, "arsenal:" или "minecraft:")
		let name = weaponId;
		const colonIndex = name.indexOf(':');
		if (colonIndex !== -1) {
			name = name.substring(colonIndex + 1);
		}

		// Преобразуем snake_case в читаемый формат
		const words = name
			.split('_')
			.map((word) => {
				// Первая буква заглавная, остальные строчные
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			})
			.join(' ');

		// Определяем эмодзи в зависимости от типа оружия
		const getWeaponIcon = (weaponName: string): string => {
			const lower = weaponName.toLowerCase();

			// Мечи и клинки
			if (lower.includes('sword') || lower.includes('blade') || lower.includes('saber')) {
				return '⚔️';
			}
			// Топоры
			if (lower.includes('axe') || lower.includes('hatchet')) {
				return '🪓';
			}
			// Луки и арбалеты
			if (lower.includes('bow') || lower.includes('crossbow')) {
				return '🏹';
			}
			// Копья и трезубцы
			if (lower.includes('spear') || lower.includes('trident')) {
				return '🔱';
			}
			// Молоты и булавы
			if (lower.includes('hammer') || lower.includes('mace') || lower.includes('club')) {
				return '🔨';
			}
			// Кинжалы и ножи
			if (lower.includes('dagger') || lower.includes('knife')) {
				return '🗡️';
			}
			// Косы
			if (lower.includes('scythe')) {
				return '☠️';
			}
			// Магическое оружие
			if (lower.includes('wand') || lower.includes('staff') || lower.includes('magic')) {
				return '✨';
			}
			// Пистолеты и револьверы
			if (lower.includes('pistol') || lower.includes('revolver')) {
				return '🔫';
			}
			// Винтовки и автоматы
			if (
				lower.includes('rifle') ||
				lower.includes('gun') ||
				lower.includes('ak') ||
				lower.includes('m4')
			) {
				return '🔫';
			}
			// По умолчанию - меч
			return '⚔️';
		};

		const icon = getWeaponIcon(name);
		return `${icon} ${words}`;
	};

	if (loading && kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsLoading message="Загрузка убийств..." />
			</StatsSection>
		);
	}

	if (error && kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsError message={error} onRetry={() => setPage(1)} />
			</StatsSection>
		);
	}

	if (kills.length === 0) {
		return (
			<StatsSection title="История убийств">
				<StatsEmpty message="Нет данных об убийствах" />
			</StatsSection>
		);
	}

	return (
		<StatsSection title="История убийств">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Жертва</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Оружие</th>
							<th className="text-left py-3 px-4 text-sm font-medium text-white/60">Дата</th>
						</tr>
					</thead>
					<tbody>
						{kills.map((kill) => {
							let victimName = getStringValue(kill.victimName);
							const victimUuid = getStringValue(kill.victimUuid);

							// Фоллбэк на ник из майнкрафта из кеша
							if (!victimName && victimUuid && playerNamesCache.has(victimUuid)) {
								victimName = playerNamesCache.get(victimUuid) || null;
							}

							const displayName = victimName || 'Неизвестно';
							const weaponRaw = getStringValue(kill.weapon);
							const weapon = weaponRaw ? formatWeaponName(weaponRaw) : 'Неизвестно';
							const dateValue = getValue(kill.date);
							const date = typeof dateValue === 'number' ? dateValue : null;

							return (
								<tr key={kill.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-3 px-4 text-sm text-white">{displayName}</td>
									<td className="py-3 px-4 text-sm text-white">{weapon}</td>
									<td className="py-3 px-4 text-sm text-white">
										{date ? formatTimestamp(date) : 'Неизвестно'}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-4">
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}
					className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Назад
				</button>
				<span className="text-sm text-white/60">Страница {page}</span>
				<button
					onClick={() => setPage((p) => p + 1)}
					disabled={!hasMore}
					className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-medium transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Вперед
				</button>
			</div>
		</StatsSection>
	);
}
