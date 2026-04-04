import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/static/**',
			},
			{
				protocol: 'https',
				hostname: 'api.dev.sluicee.ru',
				pathname: '/static/**',
			},
			{
				protocol: 'https',
				hostname: 'api.polystirolhub.net',
				pathname: '/static/**',
			},
			{
				protocol: 'https',
				hostname: 'api.polystirolhub.net',
				pathname: '/api/v1/proxy/image',
			},
			{
				protocol: 'https',
				hostname: 'api.dev.sluicee.ru',
				pathname: '/api/v1/proxy/image',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8000',
				pathname: '/api/v1/proxy/image',
			},
		],
	},
};

export default nextConfig;
