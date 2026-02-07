'use client';

import { useEffect } from 'react';
import { useBackground } from '@/lib/background/background-context';

export function BackgroundManager() {
	const { activeBackground } = useBackground();

	useEffect(() => {
		if (activeBackground) {
			// Apply background
			// We keep a slight overlay to ensure text readability
			document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${activeBackground}')`;
			document.body.style.backgroundSize = 'cover';
			document.body.style.backgroundAttachment = 'fixed';
			document.body.style.backgroundPosition = 'center';
			document.body.style.backgroundRepeat = 'no-repeat';
		} else {
			// Reset to default styles defined in globals.css
			document.body.style.backgroundImage = '';
			document.body.style.backgroundSize = '';
			document.body.style.backgroundAttachment = '';
			document.body.style.backgroundPosition = '';
			document.body.style.backgroundRepeat = '';
		}

		// Cleanup function to reset styles when component unmounts
		return () => {
			document.body.style.backgroundImage = '';
			document.body.style.backgroundSize = '';
			document.body.style.backgroundAttachment = '';
			document.body.style.backgroundPosition = '';
			document.body.style.backgroundRepeat = '';
		};
	}, [activeBackground]);

	return null;
}
