import { supabase } from '../lib/supabase';
import type { Video } from '../types';
import { API_URL } from '../config/api';

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
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to get feed';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || errorMessage;
        } else {
          // Non-JSON response (likely HTML error page)
          const text = await response.text();
          console.error('Feed API error (non-JSON):', text.substring(0, 200));
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('Failed to parse feed error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const feedService = new FeedService();

