'use client';

/**
 * My Achievements Page
 *
 * Page for viewing user's achievements
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/lib/auth';
import { questService } from '@/lib/quests';
import type { UserQuestWithQuest } from '@/lib/quests';
import {
	formatQuestName,
	formatQuestDescription,
	formatQuestProgress,
	isQuestCompleted,
	getQuestRewardText,
	getQuestDisplayData,
} from '@/lib/utils/quest-formatters';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

type StatusFilter = 'all' | 'completed' | 'uncompleted';
type SortOption = 'progress' | 'date' | 'name';

export default function MyAchievementsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [achievements, setAchievements] = useState<UserQuestWithQuest[]>([]);
	const [filteredAchievements, setFilteredAchievements] = useState<UserQuestWithQuest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [sortBy, setSortBy] = useState<SortOption>('progress');
	const isLoadingRef = useRef(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, authLoading, router]);

	// Load achievements
	useEffect(() => {
		async function loadAchievements() {
			if (!isAuthenticated || isLoadingRef.current) return;

			try {
				isLoadingRef.current = true;
				setIsLoading(true);
				setError(null);
				const data = await questService.getMyQuests();
				// Filter only achievement quests
				const achievementQuests = data.filter((userQuest) => {
					const questType = String(userQuest.quest.questType || '');
					return questType === 'achievement';
				});
				// Deduplicate by quest.id to prevent duplicates (in case same quest appears multiple times)
				const seenQuestIds = new Set<string>();
				const uniqueAchievements = achievementQuests.filter((quest) => {
					const questId = String(quest.quest.id);
					if (seenQuestIds.has(questId)) {
						return false;
					}
					seenQuestIds.add(questId);
					return true;
				});
				setAchievements(uniqueAchievements);
			} catch (err) {
				console.error('Failed to load achievements:', err);
				setError('Не удалось загрузить достижения');
			} finally {
				setIsLoading(false);
				isLoadingRef.current = false;
			}
		}

		loadAchievements();
	}, [isAuthenticated]);

	// Filter and sort achievements
	useEffect(() => {
		let filtered = [...achievements];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((item) => {
				const name = formatQuestName(item.quest.name);
				const description = formatQuestDescription(item.quest.description);
				return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
			});
		}

		// Filter by status
		if (statusFilter === 'completed') {
			filtered = filtered.filter((item) => isQuestCompleted(item.completedAt));
		} else if (statusFilter === 'uncompleted') {
			filtered = filtered.filter((item) => !isQuestCompleted(item.completedAt));
		}

		// Sort
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'progress': {
					// Sort by progress percentage (nearest to completion first)
					const { percent: percentA } = getQuestDisplayData(a);
					const { percent: percentB } = getQuestDisplayData(b);
					// Completed achievements go to the end
					const completedA = isQuestCompleted(a.completedAt);
					const completedB = isQuestCompleted(b.completedAt);
					if (completedA && !completedB) return 1;
					if (!completedA && completedB) return -1;
					// For uncompleted, sort by progress descending
					// For completed, sort by completion date descending
					if (completedA && completedB) {
						const dateA = a.completedAt ? new Date(String(a.completedAt)).getTime() : 0;
						const dateB = b.completedAt ? new Date(String(b.completedAt)).getTime() : 0;
						return dateB - dateA;
					}
					return percentB - percentA;
				}
				case 'date': {
					// Sort by completion date (newest first)
					const dateA = a.completedAt ? new Date(String(a.completedAt)).getTime() : 0;
					const dateB = b.completedAt ? new Date(String(b.completedAt)).getTime() : 0;
					// Uncompleted go to the end
					if (dateA === 0 && dateB > 0) return 1;
					if (dateA > 0 && dateB === 0) return -1;
					return dateB - dateA;
				}
				case 'name': {
					const nameA = formatQuestName(a.quest.name);
					const nameB = formatQuestName(b.quest.name);
					return nameA.localeCompare(nameB, 'ru');
				}
				default:
					return 0;
			}
		});

		setFilteredAchievements(filtered);
	}, [achievements, searchQuery, statusFilter, sortBy]);

	if (authLoading || isLoading) {
		return (
			<div className="min-h-screen pb-20 pt-24">
				<Header />
				<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 flex min-h-[60vh] flex-col items-center justify-center p-10">
						<div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<h1 className="mb-2 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
						Мои достижения
					</h1>
					<p className="text-lg text-white/60">Просмотр всех ваших достижений</p>
				</div>

				{/* Filters and Search */}
				<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 mb-6">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<Input
								type="text"
								placeholder="Поиск по названию..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full"
							/>
						</div>

						{/* Status Filter */}
						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60 whitespace-nowrap">Статус:</label>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							>
								<option value="all">Все</option>
								<option value="completed">Завершенные</option>
								<option value="uncompleted">Незавершенные</option>
							</select>
						</div>

						{/* Sort */}
						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60 whitespace-nowrap">Сортировка:</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
							>
								<option value="progress">По прогрессу</option>
								<option value="date">По дате завершения</option>
								<option value="name">По названию</option>
							</select>
						</div>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="glass-card bg-red-500/20 border border-red-500/50 p-4 mb-6">
						<p className="text-red-400">{error}</p>
					</div>
				)}

				{/* Achievements List */}
				{filteredAchievements.length === 0 ? (
					<div className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-8 text-center">
						<p className="text-white/60">
							{searchQuery || statusFilter !== 'all'
								? 'Достижения не найдены'
								: 'У вас пока нет достижений'}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredAchievements.map((userQuest) => {
							const quest = userQuest.quest;
							const {
								progress,
								targetValue,
								percent: progressPercent,
								isCompleted: completed,
							} = getQuestDisplayData(userQuest);
							const questName = formatQuestName(quest.name);
							const questDescription = formatQuestDescription(quest.description);
							const progressText = formatQuestProgress(progress, targetValue);
							const rewardText = getQuestRewardText(quest.rewardXp);
							const completedAtDate = userQuest.completedAt
								? new Date(String(userQuest.completedAt))
								: null;

							return (
								<div
									key={userQuest.id}
									className="glass-card bg-[var(--color-secondary)]/65 border border-white/10 p-4 shadow-lg"
								>
									{/* Header */}
									<div className="mb-3 flex items-start gap-3">
										<div className="text-2xl">🏆</div>
										<div className="flex-1">
											<h3 className="text-lg font-bold text-white mb-1">{questName}</h3>
											{questDescription && (
												<p className="text-sm text-white/60 line-clamp-2">{questDescription}</p>
											)}
										</div>
									</div>

									{/* Progress */}
									{!completed ? (
										<>
											<div className="mb-2 flex items-center justify-between text-xs">
												<span className="text-white/60">Прогресс</span>
												<span className="text-white font-medium">{progressText}</span>
											</div>
											<div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
												<div
													className="h-full bg-primary transition-all"
													style={{ width: `${progressPercent}%` }}
												/>
											</div>
										</>
									) : (
										<div className="mb-3">
											<div className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
												<span>✓</span>
												<span>Завершено</span>
											</div>
										</div>
									)}

									{/* Footer */}
									<div className="flex items-center justify-between text-xs">
										{rewardText && <span className="text-primary">{rewardText}</span>}
										{completedAtDate && (
											<span className="text-white/40">{formatDate(completedAtDate)}</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}
