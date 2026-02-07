'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useBackground } from '@/lib/background/background-context';

function BackgroundImage({ src }: { src: string }) {
	const [isLoaded, setIsLoaded] = useState(false);

	// Check if the domain is allowed for optimization
	// Based on next.config.ts
	// const isOptimizable = (() => {
	// 	if (src.startsWith('/')) return true;
	// 	try {
	// 		const url = new URL(src);
	// 		const allowedDomains = [
	// 			'localhost',
	// 			'api.dev.sluicee.ru',
	// 			'api.polystirolhub.net',
	// 		];
	// 		return allowedDomains.includes(url.hostname);
	// 	} catch {
	// 		return false;
	// 	}
	// })();

	return (
		<div className="fixed inset-0 -z-50">
			{/* Dark overlay for readability */}
			<div className="absolute inset-0 bg-black/20 z-10" />

			<Image
				src={src}
				alt=""
				fill
				priority
				className={`object-cover transition-opacity duration-500 ${
					isLoaded ? 'opacity-100' : 'opacity-0'
				}`}
				sizes="100vw"
				quality={75}
				unoptimized={true}
				onLoad={() => setIsLoaded(true)}
			/>

			{/* Fallback background color while loading */}
			{!isLoaded && <div className="absolute inset-0 bg-[var(--background)] -z-10" />}
		</div>
	);
}

export function BackgroundManager() {
	const { activeBackground } = useBackground();

	// Reset body styles that might have been set by previous version
	useEffect(() => {
		document.body.style.backgroundImage = '';
		document.body.style.backgroundSize = '';
		document.body.style.backgroundAttachment = '';
		document.body.style.backgroundPosition = '';
		document.body.style.backgroundRepeat = '';
	}, []);

	if (!activeBackground) return null;

	return <BackgroundImage key={activeBackground} src={activeBackground} />;
}
