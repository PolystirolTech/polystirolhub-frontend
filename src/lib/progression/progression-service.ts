/**
 * Progression Service
 *
 * Service layer for user XP and level progression API calls
 */

import type { ProgressionData, AwardXpRequest } from './types';

class ProgressionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get current user progression data
   */
  async getProgression(): Promise<ProgressionData> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me/progression`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch progression: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Award XP to the current user
   * NOTE: This endpoint is debug-only on the backend
   */
  async awardXp(amount: number): Promise<ProgressionData> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me/award-xp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xp_amount: amount } as AwardXpRequest),
    });

    if (!response.ok) {
      // Check if this is a debug-only endpoint error
      if (response.status === 403 || response.status === 404) {
        throw new Error('Debug endpoint not available in production mode');
      }
      throw new Error(`Failed to award XP: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Reset user progression to default values
   * NOTE: This endpoint is debug-only on the backend
   */
  async resetProgression(): Promise<ProgressionData> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me/reset-progression`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Check if this is a debug-only endpoint error
      if (response.status === 403 || response.status === 404) {
        throw new Error('Debug endpoint not available in production mode');
      }
      throw new Error(`Failed to reset progression: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const progressionService = new ProgressionService();
