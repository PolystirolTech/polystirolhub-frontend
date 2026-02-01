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
		],
	},
};

export default nextConfig;
