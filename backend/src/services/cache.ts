import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory cache for API responses
 * For production, consider using Redis for distributed caching
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get value from cache
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    // Enforce max size (simple LRU: delete oldest)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries matching pattern
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

/**
 * Cache middleware for Express routes
 * Usage: app.get('/api/videos', cacheMiddleware(60000), handler);
 */
export const cacheMiddleware = (ttl: number = 5 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${req.path}:${JSON.stringify(req.query)}:${(req as any).user?.id || 'anonymous'}`;

    // Try to get from cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(cacheKey, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache for specific patterns
 */
export const invalidateCache = (pattern: string): void => {
  cacheService.clearPattern(pattern);
};

/**
 * Cache keys generator helpers
 */
export const CacheKeys = {
  // Feed caches
  userFeed: (userId: string) => `feed:user:${userId}`,
  globalFeed: () => 'feed:global',
  
  // Video caches
  video: (videoId: string) => `video:${videoId}`,
  userVideos: (userId: string) => `videos:user:${userId}`,
  
  // Comment caches
  videoComments: (videoId: string) => `comments:video:${videoId}`,
  
  // Playlist caches
  playlist: (playlistId: string) => `playlist:${playlistId}`,
  userPlaylists: (userId: string) => `playlists:user:${userId}`,
  
  // Notification caches
  userNotifications: (userId: string) => `notifications:user:${userId}`,
  
  // Follow caches
  followers: (userId: string) => `followers:${userId}`,
  following: (userId: string) => `following:${userId}`,
  
  // Tag caches
  tagVideos: (tagId: string) => `tag:${tagId}:videos`,
  popularTags: () => 'tags:popular',
};

/**
 * Invalidation helpers for common operations
 */
export const CacheInvalidation = {
  // Invalidate when video is created/updated/deleted
  onVideoChange: (userId: string, videoId?: string) => {
    invalidateCache(`feed:.*`); // Invalidate all feeds
    invalidateCache(`videos:user:${userId}`);
    if (videoId) {
      invalidateCache(`video:${videoId}`);
    }
  },

  // Invalidate when comment is created/updated/deleted
  onCommentChange: (videoId: string) => {
    invalidateCache(`comments:video:${videoId}`);
  },

  // Invalidate when follow/unfollow occurs
  onFollowChange: (followerId: string, followingId: string) => {
    invalidateCache(`followers:${followingId}`);
    invalidateCache(`following:${followerId}`);
    invalidateCache(`feed:user:${followerId}`);
  },

  // Invalidate when playlist is created/updated/deleted
  onPlaylistChange: (userId: string, playlistId?: string) => {
    invalidateCache(`playlists:user:${userId}`);
    if (playlistId) {
      invalidateCache(`playlist:${playlistId}`);
    }
  },

  // Invalidate when notification is created
  onNotificationChange: (userId: string) => {
    invalidateCache(`notifications:user:${userId}`);
  },
};

