'use client';

/**
 * Badge Image Component
 *
 * Displays badge image with lazy loading and placeholder
 */

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BadgeImageProps {
	src: string | null | undefined;
	alt: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	lazy?: boolean;
}

const sizeMap = {
	sm: 24,
	md: 32,
	lg: 48,
	xl: 64,
};

export function BadgeImage({ src, alt, size = 'md', className, lazy = true }: BadgeImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const imageSize = sizeMap[size];

	// Don't render if src is empty or null
	if (!src || src.trim() === '') {
		return (
			<div
				className={cn(
					'relative inline-flex items-center justify-center overflow-hidden',
					className
				)}
				style={{ width: imageSize, height: imageSize }}
			>
				<div
					className="flex items-center justify-center bg-white/10 text-white/50 text-xs"
					style={{ width: imageSize, height: imageSize }}
				>
					?
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn('relative inline-flex items-center justify-center overflow-hidden', className)}
			style={{ width: imageSize, height: imageSize }}
		>
			{isLoading && (
				<div
					className="absolute inset-0 bg-white/10 animate-pulse"
					style={{ width: imageSize, height: imageSize }}
				/>
			)}
			{hasError ? (
				<div
					className="flex items-center justify-center bg-white/10 text-white/50 text-xs"
					style={{ width: imageSize, height: imageSize }}
				>
					?
				</div>
			) : (
				<Image
					src={src}
					alt={alt}
					width={imageSize}
					height={imageSize}
					className={cn('object-cover', isLoading && 'opacity-0')}
					loading={lazy ? 'lazy' : 'eager'}
					unoptimized={src?.startsWith('http')}
					onLoad={() => setIsLoading(false)}
					onError={() => {
						setHasError(true);
						setIsLoading(false);
					}}
				/>
			)}
		</div>
	);
}
