'use client';

import { useMemo } from 'react';

/**
 * Christmas Decorations Component
 *
 * Adds snow, garland, and Christmas tree to the page
 */
export function ChristmasDecorations() {
	// Generate snowflake data once
	const snowflakes = useMemo(() => {
		return Array.from({ length: 50 }).map((_, i) => ({
			left: (i * 137.5) % 100, // Use golden angle for distribution
			delay: (i * 0.3) % 5,
			duration: 10 + ((i * 0.2) % 10),
			opacity: 0.6 + ((i * 0.7) % 0.4),
		}));
	}, []);

	// Generate garland bulb delays once
	const garlandDelays = useMemo(() => {
		return Array.from({ length: 50 }).map((_, i) => (i * 0.4) % 2);
	}, []);

	return (
		<>
			{/* Snow Animation */}
			<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
				{snowflakes.map((snowflake, i) => (
					<div
						key={i}
						className="absolute text-white/80 text-2xl christmas-snowflake"
						style={{
							left: `${snowflake.left}%`,
							animationDelay: `${snowflake.delay}s`,
							animationDuration: `${snowflake.duration}s`,
							opacity: snowflake.opacity,
						}}
					>
						❄
					</div>
				))}
			</div>

			{/* Garland on top - wavy W shape */}
			<div className="fixed top-0 left-0 right-0 h-12 pointer-events-none z-40 overflow-hidden">
				{Array.from({ length: 50 }).map((_, i) => {
					const total = 50;
					const progress = i / (total - 1); // 0 to 1
					const x = progress * 100; // percentage from left
					// Create smooth W shape: two valleys
					const wave = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5; // 0 to 1
					const y = wave * 20 + 4; // vertical position (4 to 24px from top)

					return (
						<div
							key={i}
							className="absolute w-4 h-4 rounded-full christmas-garland-bulb"
							style={{
								left: `${x}%`,
								top: `${y}px`,
								transform: 'translateX(-50%)',
								backgroundColor: i % 3 === 0 ? '#dc2626' : i % 3 === 1 ? '#16a34a' : '#fbbf24',
								boxShadow: '0 0 8px currentColor',
								animationDelay: `${garlandDelays[i]}s`,
							}}
						/>
					);
				})}
			</div>

			{/* Christmas Tree SVG - improved */}
			<div className="fixed bottom-4 right-4 pointer-events-none z-30 w-40 h-48 opacity-90">
				<svg viewBox="0 0 120 140" className="w-full h-full">
					{/* Tree trunk with shadow */}
					<rect x="52" y="115" width="16" height="25" fill="#654321" />
					<rect x="54" y="117" width="12" height="23" fill="#8b4513" />

					{/* Tree layers with gradients and details */}
					{/* Bottom layer */}
					<polygon points="60,85 15,115 105,115" fill="#0d5d2f" />
					<polygon points="60,90 20,115 100,115" fill="#16a34a" />
					<polygon points="60,95 25,115 95,115" fill="#22c55e" />

					{/* Middle layer */}
					<polygon points="60,60 20,90 100,90" fill="#15803d" />
					<polygon points="60,65 25,90 95,90" fill="#16a34a" />
					<polygon points="60,70 30,90 90,90" fill="#22c55e" />

					{/* Top layer */}
					<polygon points="60,35 30,65 90,65" fill="#166534" />
					<polygon points="60,40 35,65 85,65" fill="#16a34a" />
					<polygon points="60,45 40,65 80,65" fill="#22c55e" />

					{/* Small top layer */}
					<polygon points="60,20 40,40 80,40" fill="#15803d" />
					<polygon points="60,25 45,40 75,40" fill="#16a34a" />

					{/* Ornaments - more detailed */}
					{/* Red ornaments */}
					<circle cx="45" cy="55" r="4" fill="#dc2626" />
					<circle cx="45" cy="55" r="2" fill="#ff6b6b" />
					<circle cx="75" cy="55" r="4" fill="#dc2626" />
					<circle cx="75" cy="55" r="2" fill="#ff6b6b" />
					<circle cx="35" cy="75" r="4" fill="#dc2626" />
					<circle cx="35" cy="75" r="2" fill="#ff6b6b" />
					<circle cx="85" cy="75" r="4" fill="#dc2626" />
					<circle cx="85" cy="75" r="2" fill="#ff6b6b" />
					<circle cx="50" cy="95" r="4" fill="#dc2626" />
					<circle cx="50" cy="95" r="2" fill="#ff6b6b" />
					<circle cx="70" cy="95" r="4" fill="#dc2626" />
					<circle cx="70" cy="95" r="2" fill="#ff6b6b" />

					{/* Gold ornaments */}
					<circle cx="60" cy="50" r="4" fill="#fbbf24" />
					<circle cx="60" cy="50" r="2" fill="#fde047" />
					<circle cx="50" cy="75" r="4" fill="#fbbf24" />
					<circle cx="50" cy="75" r="2" fill="#fde047" />
					<circle cx="70" cy="75" r="4" fill="#fbbf24" />
					<circle cx="70" cy="75" r="2" fill="#fde047" />
					<circle cx="40" cy="95" r="4" fill="#fbbf24" />
					<circle cx="40" cy="95" r="2" fill="#fde047" />
					<circle cx="80" cy="95" r="4" fill="#fbbf24" />
					<circle cx="80" cy="95" r="2" fill="#fde047" />

					{/* Blue ornaments */}
					<circle cx="55" cy="65" r="3" fill="#3b82f6" />
					<circle cx="65" cy="65" r="3" fill="#3b82f6" />
					<circle cx="60" cy="85" r="3" fill="#3b82f6" />

					{/* Star on top - improved */}
					<path
						d="M60,10 L61,18 L70,18 L63,24 L66,32 L60,27 L54,32 L57,24 L50,18 L59,18 Z"
						fill="#fde047"
					/>
					{/* Star glow */}
					<circle cx="60" cy="20" r="8" fill="#fbbf24" opacity="0.3" />
				</svg>
			</div>
		</>
	);
}
