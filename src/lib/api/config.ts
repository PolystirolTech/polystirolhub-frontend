/**
 * API Client Configuration
 *
 * This file provides a configured API client instance for making requests to the backend.
 */

import { Configuration } from './generated';

/**
 * Base API configuration
 */
/**
 * Determine the base path based on the environment
 * Server-side: Use internal Docker URL (if available)
 * Client-side: Use public URL
 */
const getBasePath = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * Base API configuration
 */
export const apiConfig = new Configuration({
  basePath: getBasePath(),
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies in requests
});

/**
 * Get API configuration with optional auth token
 */
export const getApiConfig = (token?: string): Configuration => {
  return new Configuration({
    basePath: getBasePath(),
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });
};
