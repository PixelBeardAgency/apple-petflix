import 'dotenv/config';
import { google, youtube_v3 } from 'googleapis';
import NodeCache from 'node-cache';
import { logger } from './logger';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// Cache for YouTube API responses (5 min for search, 1 hour for trending)
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default

// Quota tracking (10,000 units/day free tier)
let dailyQuotaUsed = 0;
const DAILY_QUOTA_LIMIT = 10000;
const QUOTA_WARNING_THRESHOLD = 8000; // 80%

export class YouTubeService {
  /**
   * Search for videos
   * Cost: 100 units per request
   */
  async searchVideos(
    query: string,
    maxResults: number = 10,
    order: 'relevance' | 'date' | 'viewCount' | 'rating' = 'relevance',
    pageToken?: string
  ): Promise<{ results: youtube_v3.Schema$SearchResult[]; nextPageToken?: string }> {
    const cacheKey = `search:${query}:${maxResults}:${order}:${pageToken || 'initial'}`;
    const cached = cache.get<{ results: youtube_v3.Schema$SearchResult[]; nextPageToken?: string }>(cacheKey);

    if (cached) {
      logger.debug('Returning cached YouTube search results');
      return cached;
    }

    // Check quota
    this.checkQuota(100);

    // Add pet-related keywords to ensure pet content
    const petEnhancedQuery = `${query} (pet OR cat OR dog OR animal OR puppy OR kitten)`;

    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: petEnhancedQuery,
        type: ['video'],
        maxResults,
        order,
        pageToken,
        relevanceLanguage: 'en',
        safeSearch: 'moderate',
        videoCategoryId: '15', // Pets & Animals category
      });

      dailyQuotaUsed += 100;
      this.logQuotaUsage();

      const results = response.data.items || [];
      const responseData = { 
        results, 
        nextPageToken: response.data.nextPageToken || undefined 
      };
      cache.set(cacheKey, responseData);

      return responseData;
    } catch (error: any) {
      logger.error('YouTube API search error:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        details: error.response?.data,
      });
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }

  /**
   * Get video details by ID
   * Cost: 1 unit per request
   */
  async getVideoDetails(videoId: string): Promise<youtube_v3.Schema$Video | null> {
    const cacheKey = `video:${videoId}`;
    const cached = cache.get<youtube_v3.Schema$Video>(cacheKey);

    if (cached) {
      logger.debug('Returning cached video details');
      return cached;
    }

    this.checkQuota(1);

    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId],
      });

      dailyQuotaUsed += 1;

      const video = response.data.items?.[0] || null;
      if (video) {
        cache.set(cacheKey, video, 3600); // Cache for 1 hour
      }

      return video;
    } catch (error) {
      logger.error('YouTube API video details error:', error);
      throw new Error('Failed to get video details');
    }
  }

  /**
   * Get trending pet videos
   * Cost: 100 units per request
   */
  async getTrendingVideos(maxResults: number = 20): Promise<youtube_v3.Schema$SearchResult[]> {
    const cacheKey = `trending:${maxResults}`;
    const cached = cache.get<youtube_v3.Schema$SearchResult[]>(cacheKey);

    if (cached) {
      logger.debug('Returning cached trending videos');
      return cached;
    }

    this.checkQuota(100);

    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: 'pets animals cats dogs', // Add broad pet-related query
        type: ['video'],
        maxResults,
        order: 'viewCount',
        publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        videoCategoryId: '15', // Pets & Animals
        relevanceLanguage: 'en',
      });

      dailyQuotaUsed += 100;
      this.logQuotaUsage();

      const results = response.data.items || [];
      cache.set(cacheKey, results, 3600); // Cache for 1 hour

      return results;
    } catch (error) {
      logger.error('YouTube API trending error:', error);
      throw new Error('Failed to get trending videos');
    }
  }

  /**
   * Validate YouTube video ID
   */
  isValidYouTubeUrl(url: string): { valid: boolean; videoId?: string } {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { valid: true, videoId: match[1] };
      }
    }

    return { valid: false };
  }

  /**
   * Check if quota limit is reached
   */
  private checkQuota(cost: number) {
    if (dailyQuotaUsed + cost > DAILY_QUOTA_LIMIT) {
      logger.error('YouTube API quota exceeded');
      throw new Error('Daily YouTube API quota exceeded. Please try again tomorrow.');
    }

    if (dailyQuotaUsed + cost > QUOTA_WARNING_THRESHOLD) {
      logger.warn(`YouTube API quota usage is high: ${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT}`);
    }
  }

  /**
   * Log quota usage
   */
  private logQuotaUsage() {
    logger.info(`YouTube API quota used: ${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT}`);
  }

  /**
   * Reset daily quota (should be called at midnight)
   */
  resetDailyQuota() {
    dailyQuotaUsed = 0;
    logger.info('YouTube API daily quota reset');
  }

  /**
   * Get current quota usage
   */
  getQuotaUsage(): { used: number; limit: number; percentage: number } {
    return {
      used: dailyQuotaUsed,
      limit: DAILY_QUOTA_LIMIT,
      percentage: (dailyQuotaUsed / DAILY_QUOTA_LIMIT) * 100,
    };
  }
}

export const youtubeService = new YouTubeService();

