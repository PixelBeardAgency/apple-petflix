import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class FollowService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async followUser(userId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to follow users');
    }

    const response = await fetch(`${API_URL}/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to unfollow users');
    }

    const response = await fetch(`${API_URL}/api/users/${userId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to unfollow user');
    }
  }

  async getFollowers(userId: string, limit: number = 20, offset: number = 0) {
    const response = await fetch(
      `${API_URL}/api/users/${userId}/followers?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get followers');
    }

    return response.json();
  }

  async getFollowing(userId: string, limit: number = 20, offset: number = 0) {
    const response = await fetch(
      `${API_URL}/api/users/${userId}/following?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get following');
    }

    return response.json();
  }

  async getFollowStatus(userId: string): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/users/${userId}/follow-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isFollowing;
  }
}

export const followService = new FollowService();

