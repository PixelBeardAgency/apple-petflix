import { API_URL } from '../config/api';
import type { User } from '../types';

class ProfileService {
  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  }

  /**
   * Search for profiles by username
   */
  async searchProfiles(query: string): Promise<User[]> {
    const token = await this.getAuthToken();
    const response = await fetch(
      `${API_URL}/api/profiles/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to search profiles');
    }

    return response.json();
  }

  /**
   * Get a profile by ID
   */
  async getProfile(userId: string): Promise<User> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/profiles/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get profile');
    }

    return response.json();
  }

  /**
   * Update current user's profile
   */
  async updateProfile(updates: {
    username?: string;
    bio?: string;
    profile_picture_url?: string;
  }): Promise<User> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/profiles`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update profile');
    }

    return response.json();
  }
}

export const profileService = new ProfileService();

