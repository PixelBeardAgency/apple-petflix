import { supabase } from '../lib/supabase';
import { API_URL } from '../config/api';

export class TagService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getPopularTags(limit: number = 50) {
    const response = await fetch(`${API_URL}/api/tags?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get tags');
    }

    return response.json();
  }

  async getPlaylistTags(playlistId: string) {
    const response = await fetch(`${API_URL}/api/tags/playlist/${playlistId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get playlist tags');
    }

    return response.json();
  }

  async addTag(playlistId: string, videoId: string, tagName: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ playlistId, videoId, tagName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add tag');
    }

    return response.json();
  }

  async deleteTag(tagId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete tag');
    }
  }
}

export const tagService = new TagService();

