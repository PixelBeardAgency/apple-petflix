import { supabase } from '../lib/supabase';
import { API_URL } from '../config/api';

export class PlaylistService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getPlaylists(limit: number = 20, offset: number = 0) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to view playlists');
    }

    const response = await fetch(
      `${API_URL}/api/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get playlists');
    }

    return response.json();
  }

  async getPlaylist(playlistId: string) {
    const token = await this.getAuthToken();

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get playlist');
    }

    return response.json();
  }

  async createPlaylist(name: string, description?: string, is_public: boolean = true) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to create playlists');
    }

    const response = await fetch(`${API_URL}/api/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, is_public }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create playlist');
    }

    return response.json();
  }

  async updatePlaylist(playlistId: string, name?: string, description?: string, is_public?: boolean) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, is_public }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update playlist');
    }

    return response.json();
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete playlist');
    }
  }

  /**
   * Check which playlists contain a specific video
   */
  async checkVideoInPlaylists(videoId: string): Promise<string[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/playlists/check/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check playlists');
    }

    const data = await response.json();
    return data.playlistIds;
  }

  async addVideo(playlistId: string, videoId: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add video to playlist');
    }

    return response.json();
  }

  async removeVideo(playlistId: string, videoId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/playlists/${playlistId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to remove video from playlist');
    }
  }
}

export const playlistService = new PlaylistService();

