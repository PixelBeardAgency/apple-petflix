import { supabase } from '../lib/supabase';
import type { Video } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class VideoService {
  /**
   * Get auth token
   */
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Share a video
   */
  async shareVideo(youtubeUrl: string, title?: string, description?: string): Promise<Video> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to share videos');
    }

    const response = await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ youtubeUrl, title, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to share video');
    }

    return response.json();
  }

  /**
   * Get video details
   */
  async getVideo(videoId: string): Promise<Video> {
    const response = await fetch(`${API_URL}/api/videos/${videoId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get video');
    }

    return response.json();
  }

  /**
   * Update video
   */
  async updateVideo(videoId: string, title: string, description: string): Promise<Video> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to update videos');
    }

    const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update video');
    }

    return response.json();
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to delete videos');
    }

    const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete video');
    }
  }

  /**
   * Report video
   */
  async reportVideo(videoId: string, reason: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to report videos');
    }

    const response = await fetch(`${API_URL}/api/videos/${videoId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to report video');
    }
  }
}

export const videoService = new VideoService();

