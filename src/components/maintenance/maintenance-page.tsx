'use client';

export function MaintenancePage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-2xl">
					<div className="text-center space-y-6">
						{/* Иконка */}
						<div className="flex justify-center">
							<div className="glass bg-[var(--color-primary)]/20 backdrop-blur-md border border-primary/30 rounded-2xl p-6">
								<svg
									className="h-16 w-16 text-primary"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
						</div>

						{/* Заголовок */}
						<div>
							<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
								Скоро запуск!
							</h1>
							<p className="text-lg md:text-xl text-white/80 leading-relaxed">
								Ведутся технические работы по улучшению платформы.
							</p>
						</div>

						{/* Описание */}
						<div className="pt-4 border-t border-white/10">
							<p className="text-sm md:text-base text-white/60">
								Следите за обновлениями в ПолистиролБлоке
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
