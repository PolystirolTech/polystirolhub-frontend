/**
 * API Client Configuration
 *
 * This file provides a configured API client instance for making requests to the backend.
 */

import { Configuration } from './generated';

/**
 * Base API configuration
 */
export const apiConfig = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get API configuration with optional auth token
 */
export const getApiConfig = (token?: string): Configuration => {
  return new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};
