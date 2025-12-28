'use client';

import { useEffect, useState } from 'react';

/**
 * Christmas Decorations Component
 *
 * Adds snow, garland, and Christmas tree to the page
 */

/**
 * Christmas Decorations Component
 *
 * Adds snow, garland, and Christmas tree to the page
 */
export function ChristmasDecorations() {
	const [snowflakes, setSnowflakes] = useState<
		{
			left: number;
			animationName: string;
			delay: number;
			duration: number;
			opacity: number;
			size: number;
		}[]
	>([]);

	const [garlandBulbs, setGarlandBulbs] = useState<
		{ x: number; y: number; color: string; delay: number }[]
	>([]);

	useEffect(() => {
		// Use setTimeout to avoid 'setState directly in effect' lint warning
		// which warns about synchronous updates preventing browser paint/cascading renders
		const timer = setTimeout(() => {
			const newSnowflakes = Array.from({ length: 75 }).map((_, i) => ({
				left: Math.random() * 100,
				animationName: `christmas-snowfall-sway-${(i % 3) + 1}`,
				delay: Math.random() * 10,
				duration: 10 + Math.random() * 15,
				opacity: 0.3 + Math.random() * 0.7,
				size: 1 + Math.random() * 1.5,
			}));
			setSnowflakes(newSnowflakes);

			const count = 24;
			const newGarlandBulbs = Array.from({ length: count }).map((_, i) => {
				const progress = (i + 0.5) / count;
				const x = progress * 100;
				const t = progress;
				const y = Math.pow(1 - t, 2) * 5 + 2 * (1 - t) * t * 50 + Math.pow(t, 2) * 5;

				return {
					x,
					y,
					color:
						i % 4 === 0 ? '#ef4444' : i % 4 === 1 ? '#22c55e' : i % 4 === 2 ? '#eab308' : '#3b82f6',
					delay: i * 0.15,
				};
			});
			setGarlandBulbs(newGarlandBulbs);
		}, 0);

		return () => clearTimeout(timer);
	}, []);

	if (snowflakes.length === 0) {
		return null;
	}

	return (
		<>
			{/* Snow Animation */}
			<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
				{snowflakes.map((snowflake, i) => (
					<div
						key={i}
						className="absolute text-white select-none pointer-events-none"
						style={{
							left: `${snowflake.left}%`,
							top: -20,
							fontSize: `${snowflake.size}rem`,
							animationName: snowflake.animationName,
							animationTimingFunction: 'linear',
							animationIterationCount: 'infinite',
							animationDelay: `${snowflake.delay}s`,
							animationDuration: `${snowflake.duration}s`,
							opacity: snowflake.opacity,
						}}
					>
						❄
					</div>
				))}
			</div>

			{/* Garland on top - SVG for wire */}
			<div className="fixed top-0 left-0 right-0 h-24 pointer-events-none z-40 overflow-hidden">
				<svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
					<path
						d="M0,5 Q50,110 100,5"
						fill="none"
						stroke="#2c3e50"
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
				{garlandBulbs.map((bulb, i) => (
					<div
						key={i}
						className="absolute w-3 h-3 rounded-full christmas-garland-bulb"
						style={{
							left: `${bulb.x}%`,
							top: `${bulb.y}px`, // Slight offset for bulb hanging
							transform: 'translateX(-50%)',
							backgroundColor: bulb.color,
							boxShadow: `0 0 10px ${bulb.color}`,
							animationDelay: `${bulb.delay}s`,
						}}
					/>
				))}
			</div>

			{/* Christmas Tree SVG - improved */}
			<div className="fixed bottom-0 right-8 pointer-events-none z-30 w-64 h-80 opacity-90 origin-bottom">
				<svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl">
					{/* Shadow base */}
					<ellipse cx="100" cy="225" rx="50" ry="10" fill="#000" opacity="0.2" />
					{/* Tree trunk */}
					<path d="M90 200 H110 V230 H90 Z" fill="#4B3621" />
					{/* Levels */}
					{/* Bottom */}
					<path d="M100 60 L160 200 H40 L100 60 Z" fill="#1e4d2b" />
					<path d="M100 60 L160 200 H100 Z" fill="#143d20" /> {/* Shading right side */}
					{/* Middle */}
					<path d="M100 40 L150 150 H50 L100 40 Z" fill="#266e3b" />
					<path d="M100 40 L150 150 H100 Z" fill="#1b5a2e" />
					{/* Top */}
					<path d="M100 20 L140 100 H60 L100 20 Z" fill="#35914d" />
					<path d="M100 20 L140 100 H100 Z" fill="#257a3e" />
					{/* Soft highlights on edges */}
					<path
						d="M40 200 L100 60"
						stroke="#ffffff"
						strokeWidth="2"
						strokeOpacity="0.1"
						fill="none"
					/>
					<path
						d="M50 150 L100 40"
						stroke="#ffffff"
						strokeWidth="2"
						strokeOpacity="0.1"
						fill="none"
					/>
					<path
						d="M60 100 L100 20"
						stroke="#ffffff"
						strokeWidth="2"
						strokeOpacity="0.1"
						fill="none"
					/>
					{/* Ornaments */}
					{/* Random positions manually placed for aesthetics */}
					<circle cx="90" cy="80" r="4" fill="#fbbf24" filter="url(#glow)" />
					<circle cx="120" cy="120" r="4" fill="#ef4444" filter="url(#glow)" />
					<circle cx="80" cy="160" r="4" fill="#3b82f6" filter="url(#glow)" />
					<circle cx="130" cy="180" r="4" fill="#fbbf24" filter="url(#glow)" />
					<circle cx="70" cy="130" r="4" fill="#ef4444" filter="url(#glow)" />
					<circle cx="110" cy="90" r="4" fill="#3b82f6" filter="url(#glow)" />
					<circle cx="100" cy="140" r="4" fill="#ffffff" opacity="0.8" filter="url(#glow)" />
					<circle cx="60" cy="190" r="4" fill="#fbbf24" filter="url(#glow)" />
					<circle cx="140" cy="190" r="4" fill="#ef4444" filter="url(#glow)" />
					{/* Tinsel / Garland lines on tree */}
					<path
						d="M70 110 Q100 130 130 110"
						fill="none"
						stroke="#fbbf24"
						strokeWidth="2"
						opacity="0.6"
					/>
					<path
						d="M60 170 Q100 190 140 170"
						fill="none"
						stroke="#fbbf24"
						strokeWidth="2"
						opacity="0.6"
					/>
					{/* Star on top */}
					<path
						transform="translate(100, 20) scale(1.5)"
						d="M0,-10 L2.9,-3.2 L10,-3.2 L4.7,1.2 L6.5,8.2 L0,4.2 L-6.5,8.2 L-4.7,1.2 L-10,-3.2 L-2.9,-3.2 Z"
						fill="#fbbf24"
						filter="url(#glow)"
					/>
					<defs>
						<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="2" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
				</svg>
			</div>
		</>
	);
}
