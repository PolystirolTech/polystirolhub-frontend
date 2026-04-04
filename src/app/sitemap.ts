import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://polystirol-hub.ru';
	const lastModified = new Date();

	return [
		{
			url: baseUrl,
			lastModified,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/servers`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/stats`,
			lastModified,
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/shop`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/badges`,
			lastModified,
			changeFrequency: 'monthly',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/legal/privacy`,
			lastModified,
			changeFrequency: 'monthly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/legal/terms`,
			lastModified,
			changeFrequency: 'monthly',
			priority: 0.3,
		},
	];
}
