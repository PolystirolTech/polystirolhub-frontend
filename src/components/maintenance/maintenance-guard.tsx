'use client';

import { useAuth } from '@/lib/auth';
import { MaintenancePage } from './maintenance-page';

interface MaintenanceGuardProps {
	children: React.ReactNode;
}

/**
 * Компонент-обертка для проверки режима обслуживания
 *
 * Проверяет переменную окружения NEXT_PUBLIC_MAINTENANCE_MODE.
 * Если режим включен и пользователь не супер-админ - показывает заглушку.
 * Если режим выключен или пользователь супер-админ - рендерит children.
 *
 * Для включения режима обслуживания установите:
 * NEXT_PUBLIC_MAINTENANCE_MODE=true
 *
 * Для выключения:
 * NEXT_PUBLIC_MAINTENANCE_MODE=false или не устанавливайте переменную
 *
 * Важно: переменные NEXT_PUBLIC_* встраиваются в клиентский бандл во время сборки,
 * поэтому для изменения режима потребуется пересборка приложения.
 */
export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
	const { user, isLoading } = useAuth();

	// Проверяем переменную окружения (встраивается в бандл при сборке)
	const isMaintenanceMode =
		process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
		process.env.NEXT_PUBLIC_MAINTENANCE_MODE === '1';

	// Если режим обслуживания выключен - показываем обычный сайт
	if (!isMaintenanceMode) {
		return <>{children}</>;
	}

	// Если режим включен, но пользователь еще загружается - показываем загрузку
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
			</div>
		);
	}

	// Если режим включен и пользователь супер-админ - показываем обычный сайт
	if (user?.is_super_admin) {
		return <>{children}</>;
	}

	// Во всех остальных случаях показываем заглушку
	return <MaintenancePage />;
}
