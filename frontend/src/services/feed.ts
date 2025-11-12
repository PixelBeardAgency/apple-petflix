import { supabase } from '../lib/supabase';
import type { Video } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class FeedService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getFeed(limit: number = 20, offset: number = 0): Promise<{
    videos: Video[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to view your feed');
    }

    const response = await fetch(
      `${API_URL}/api/feed?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get feed');
    }

    return response.json();
  }
}

export const feedService = new FeedService();

