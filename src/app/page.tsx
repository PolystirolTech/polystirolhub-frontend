import { Header } from '@/components/layout/header';
import { BentoGrid } from '@/components/bento/bento-grid';
import { BannerWidget } from '@/components/bento/widgets/banner-widget';
import { ProfileWidget } from '@/components/bento/widgets/profile-widget';
import { NotificationsWidget } from '@/components/bento/widgets/notifications-widget';
import { GameServersWidget } from '@/components/bento/widgets/game-servers-widget';
import { ActivityWidget } from '@/components/bento/widgets/activity-widget';
import { TopUsersWidget } from '@/components/bento/widgets/top-users-widget';
import { DailyQuestsWidget } from '@/components/bento/widgets/daily-quests-widget';
import { AchievementsWidget } from '@/components/bento/widgets/achievements-widget';

export default function Home() {
	return (
		<div className="min-h-screen pb-20 pt-24">
			<Header />

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
				{/* Баннер сверху */}
				<BannerWidget />

				{/* Три колонки */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Левая колонка */}
					<div className="flex flex-col gap-6 lg:col-span-3">
						<ProfileWidget />
						<NotificationsWidget />
						<AchievementsWidget />
					</div>

					{/* Средняя колонка */}
					<div className="flex flex-col gap-6 lg:col-span-6">
						<GameServersWidget />
						<ActivityWidget />
					</div>

					{/* Правая колонка */}
					<div className="flex flex-col gap-6 lg:col-span-3">
						<TopUsersWidget />
						<DailyQuestsWidget />
					</div>
				</div>
			</main>
		</div>
	);
}
