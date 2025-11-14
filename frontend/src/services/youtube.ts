import type { YouTubeVideo } from '../types';
import { API_URL } from '../config/api';

export class YouTubeAPIService {
  /**
   * Search for YouTube videos
   */
  async searchVideos(
    query: string,
    maxResults: number = 10,
    order: 'relevance' | 'date' | 'viewCount' | 'rating' = 'relevance'
  ): Promise<{ videos: YouTubeVideo[]; count: number; query: string }> {
    const response = await fetch(
      `${API_URL}/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=${order}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search videos');
    }

    return response.json();
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideo> {
    const response = await fetch(`${API_URL}/api/youtube/video/${videoId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get video details');
    }

    return response.json();
  }

  /**
   * Get trending pet videos
   */
  async getTrendingVideos(maxResults: number = 20): Promise<{ videos: YouTubeVideo[]; count: number }> {
    const response = await fetch(`${API_URL}/api/youtube/trending?maxResults=${maxResults}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get trending videos');
    }

    return response.json();
  }

  /**
   * Validate YouTube URL
   */
  async validateYouTubeUrl(url: string): Promise<{
    valid: boolean;
    videoId?: string;
    video?: YouTubeVideo;
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/api/youtube/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate URL');
    }

    return response.json();
  }

  /**
   * Get YouTube API quota usage
   */
  async getQuotaUsage(): Promise<{ used: number; limit: number; percentage: number }> {
    const response = await fetch(`${API_URL}/api/youtube/quota`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quota usage');
    }

    return response.json();
  }
}

export const youtubeAPI = new YouTubeAPIService();

