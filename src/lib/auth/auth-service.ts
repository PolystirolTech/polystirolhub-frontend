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
