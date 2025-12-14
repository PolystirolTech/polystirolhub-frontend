export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
			<div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-4">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
					<div className="text-center sm:text-left">
						<p className="text-xs text-white/80">
							© {currentYear} PolystirolHub
						</p>
						<p className="text-xs text-white/60 mt-0.5">
							Разработано PolystirolTech
						</p>
					</div>
					<a
						href="https://boosty.to/sluicee/donate"
						target="_blank"
						rel="noopener noreferrer"
						className="glass bg-[#d45124] backdrop-blur-md border border-[#9333EA]/30 hover:bg-[#9333EA]/30 transition-all px-4 py-2 rounded-xl text-white font-medium text-xs hover:scale-[1.02] active:scale-[0.98]"
					>
						Поддержать проект
					</a>
				</div>
			</div>
		</footer>
	);
}
