/**
 * Authentication Service
 *
 * Service layer for handling authentication with the backend API.
 * Uses the generated AuthApi client for all authentication operations.
 */

import { AuthApi } from '@/lib/api/generated';
import { apiConfig } from '@/lib/api/config';
import type { User, OAuthProvider, ProviderConnection } from './types';

class AuthService {
  private authApi: AuthApi;

  constructor() {
    this.authApi = new AuthApi(apiConfig);
  }

  /**
   * Initiate OAuth login flow by redirecting to backend login endpoint
   * Backend will generate state token and redirect to OAuth provider
   */
  async initiateLogin(provider: OAuthProvider): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const loginUrl = `${baseUrl}/api/v1/auth/login/${provider}`;

    // Redirect to backend login endpoint
    window.location.href = loginUrl;
  }

  /**
   * Initiate OAuth linking flow by redirecting to backend link endpoint
   */
  async initiateLink(provider: OAuthProvider): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const linkUrl = `${baseUrl}/api/v1/auth/link/${provider}`;

    // Redirect to backend link endpoint
    window.location.href = linkUrl;
  }

  /**
   * Get current authenticated user from backend
   * Uses JWT from HTTP-only cookie automatically sent by browser
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.authApi.getCurrentUserInfoApiV1AuthMeGet();
      return response as User;
    } catch (error: unknown) {
      // If 401, user is not authenticated - this is expected
      // We need to safely check if error object has response status
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        return null;
      }

      // For other errors, log but still return null
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Logout user by calling backend logout endpoint
   * Backend will clear the HTTP-only cookie
   */
  async logout(): Promise<void> {
    try {
      await this.authApi.logoutApiV1AuthLogoutPost();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
    }
  }

  /**
   * Unlink an OAuth provider from the current account
   */
  async unlinkProvider(provider: string): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // We need to fetch the token to add it to the header manually since we're bypassing the generated client
      // However the generated client uses a configuration that we can't easily access the token from if it's stored in a cookie only.
      // But typically for these ops we rely on the browser sending the cookie.

      const response = await fetch(`${baseUrl}/api/v1/auth/unlink/${provider}`, {
        method: 'DELETE',
        // Credentials include is needed for cookies
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unlink provider');
      }
    } catch (error) {
      console.error('Failed to unlink provider:', error);
      throw error;
    }
  }

  /**
   * Delete the current user's account
   */
  async deleteAccount(): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/users/me`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  /**
   * Get list of connected OAuth providers
   */
  async getUserProviders(): Promise<ProviderConnection[]> {
    try {
      const response = await this.authApi.getUserProvidersApiV1AuthMeProvidersGet();
      return response as ProviderConnection[];
    } catch (error) {
      console.error('Failed to get user providers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
