/**
 * API Client Exports
 *
 * Re-export generated API client and configuration for easy importing throughout the app.
 *
 * Usage:
 *   import { api, getApiConfig } from '@/lib/api';
 *   const data = await api.someEndpoint();
 */

// Re-export generated types and clients
export * from './generated';

// Export configuration helpers
export { apiConfig, getApiConfig } from './config';
