import { cacheService, cacheMiddleware, invalidateCache, CacheKeys, CacheInvalidation } from '../cache';
import { Request, Response, NextFunction } from 'express';

describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('cacheService', () => {
    it('should store and retrieve values', () => {
      cacheService.set('test-key', { data: 'test' });
      const result = cacheService.get('test-key');
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should expire entries after TTL', () => {
      jest.useFakeTimers();
      cacheService.set('test-key', { data: 'test' }, 1000);
      
      expect(cacheService.get('test-key')).toEqual({ data: 'test' });
      
      jest.advanceTimersByTime(1001);
      expect(cacheService.get('test-key')).toBeNull();
      
      jest.useRealTimers();
    });

    it('should delete specific keys', () => {
      cacheService.set('test-key', { data: 'test' });
      expect(cacheService.get('test-key')).toBeTruthy();
      
      cacheService.delete('test-key');
      expect(cacheService.get('test-key')).toBeNull();
    });

    it('should clear pattern matching keys', () => {
      cacheService.set('user:123:profile', { name: 'User 123' });
      cacheService.set('user:456:profile', { name: 'User 456' });
      cacheService.set('video:789', { title: 'Video 789' });
      
      cacheService.clearPattern('user:.*');
      
      expect(cacheService.get('user:123:profile')).toBeNull();
      expect(cacheService.get('user:456:profile')).toBeNull();
      expect(cacheService.get('video:789')).toBeTruthy();
    });

    it('should clear all cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.clear();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });

    it('should provide statistics', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      const stats = cacheService.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBeGreaterThan(0);
    });

    it('should enforce max size (LRU)', () => {
      const smallCache = new (cacheService.constructor as any)(3);
      
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      smallCache.set('key4', 'value4');
      
      // First key should be evicted
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key4')).toBe('value4');
    });
  });

  describe('cacheMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        path: '/api/test',
        query: {},
      };
      mockRes = {
        statusCode: 200,
        json: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should cache GET request responses', () => {
      const middleware = cacheMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      
      // Simulate response
      const responseData = { data: 'test' };
      (mockRes.json as jest.Mock)(responseData);
      
      // Second request should use cache
      const mockReq2 = { ...mockReq };
      const mockRes2 = { ...mockRes, json: jest.fn() };
      const nextFunction2 = jest.fn();
      
      middleware(mockReq2 as Request, mockRes2 as Response, nextFunction2);
      
      expect(mockRes2.json).toHaveBeenCalledWith(responseData);
      expect(nextFunction2).not.toHaveBeenCalled();
    });

    it('should not cache non-GET requests', () => {
      mockReq.method = 'POST';
      const middleware = cacheMiddleware(5000);
      
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not cache error responses', () => {
      mockRes.statusCode = 500;
      const middleware = cacheMiddleware(5000);
      
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      
      (mockRes.json as jest.Mock)({ error: 'Server error' });
      
      // Should not be cached
      const mockReq2 = { ...mockReq };
      const mockRes2 = { ...mockRes, json: jest.fn(), statusCode: 200 };
      const nextFunction2 = jest.fn();
      
      middleware(mockReq2 as Request, mockRes2 as Response, nextFunction2);
      expect(nextFunction2).toHaveBeenCalled();
    });
  });

  describe('CacheKeys', () => {
    it('should generate consistent cache keys', () => {
      expect(CacheKeys.userFeed('user123')).toBe('feed:user:user123');
      expect(CacheKeys.video('video456')).toBe('video:video456');
      expect(CacheKeys.videoComments('video789')).toBe('comments:video:video789');
      expect(CacheKeys.playlist('playlist001')).toBe('playlist:playlist001');
      expect(CacheKeys.userPlaylists('user456')).toBe('playlists:user:user456');
      expect(CacheKeys.userNotifications('user789')).toBe('notifications:user:user789');
      expect(CacheKeys.followers('user123')).toBe('followers:user123');
      expect(CacheKeys.following('user456')).toBe('following:user456');
      expect(CacheKeys.tagVideos('tag123')).toBe('tag:tag123:videos');
      expect(CacheKeys.popularTags()).toBe('tags:popular');
    });
  });

  describe('CacheInvalidation', () => {
    beforeEach(() => {
      // Setup cache entries
      cacheService.set('feed:user:123', { data: 'feed' });
      cacheService.set('feed:global', { data: 'global' });
      cacheService.set('videos:user:123', { data: 'videos' });
      cacheService.set('video:456', { data: 'video' });
      cacheService.set('comments:video:456', { data: 'comments' });
      cacheService.set('followers:123', { data: 'followers' });
      cacheService.set('following:456', { data: 'following' });
      cacheService.set('playlists:user:123', { data: 'playlists' });
      cacheService.set('playlist:789', { data: 'playlist' });
      cacheService.set('notifications:user:123', { data: 'notifications' });
    });

    it('should invalidate video-related caches', () => {
      CacheInvalidation.onVideoChange('123', '456');
      
      expect(cacheService.get('feed:user:123')).toBeNull();
      expect(cacheService.get('feed:global')).toBeNull();
      expect(cacheService.get('videos:user:123')).toBeNull();
      expect(cacheService.get('video:456')).toBeNull();
    });

    it('should invalidate comment-related caches', () => {
      CacheInvalidation.onCommentChange('456');
      
      expect(cacheService.get('comments:video:456')).toBeNull();
    });

    it('should invalidate follow-related caches', () => {
      CacheInvalidation.onFollowChange('456', '123');
      
      expect(cacheService.get('followers:123')).toBeNull();
      expect(cacheService.get('following:456')).toBeNull();
      expect(cacheService.get('feed:user:456')).toBeNull();
    });

    it('should invalidate playlist-related caches', () => {
      CacheInvalidation.onPlaylistChange('123', '789');
      
      expect(cacheService.get('playlists:user:123')).toBeNull();
      expect(cacheService.get('playlist:789')).toBeNull();
    });

    it('should invalidate notification-related caches', () => {
      CacheInvalidation.onNotificationChange('123');
      
      expect(cacheService.get('notifications:user:123')).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache by pattern', () => {
      cacheService.set('test:1', 'value1');
      cacheService.set('test:2', 'value2');
      cacheService.set('other:1', 'value3');
      
      invalidateCache('test:.*');
      
      expect(cacheService.get('test:1')).toBeNull();
      expect(cacheService.get('test:2')).toBeNull();
      expect(cacheService.get('other:1')).toBeTruthy();
    });
  });
});

