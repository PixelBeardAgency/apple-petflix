import { youtubeService } from '../youtube';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn(() => ({
      search: {
        list: jest.fn(),
      },
      videos: {
        list: jest.fn(),
      },
    })),
  },
}));

describe('YouTube Service', () => {
  describe('searchVideos', () => {
    it('should search for videos successfully', async () => {
      const mockResults = {
        data: {
          items: [
            {
              id: { videoId: 'test123' },
              snippet: {
                title: 'Cute Cat Video',
                description: 'A cute cat',
                thumbnails: {
                  high: { url: 'https://example.com/thumb.jpg' },
                },
                channelTitle: 'Cat Channel',
              },
            },
          ],
        },
      };

      const { google } = require('googleapis');
      const mockYoutube = google.youtube();
      mockYoutube.search.list.mockResolvedValue(mockResults);

      const results = await youtubeService.searchVideos('cat');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle search errors', async () => {
      const { google } = require('googleapis');
      const mockYoutube = google.youtube();
      mockYoutube.search.list.mockRejectedValue(new Error('API Error'));

      await expect(youtubeService.searchVideos('cat')).rejects.toThrow();
    });

    it('should use cache for repeated searches', async () => {
      const { google } = require('googleapis');
      const mockYoutube = google.youtube();
      const mockResults = {
        data: {
          items: [],
        },
      };
      mockYoutube.search.list.mockResolvedValue(mockResults);

      // First call
      await youtubeService.searchVideos('dog');
      
      // Second call should use cache
      await youtubeService.searchVideos('dog');

      // Should only call API once due to caching
      expect(mockYoutube.search.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVideoById', () => {
    it('should get video details by ID', async () => {
      const mockVideo = {
        data: {
          items: [
            {
              id: 'test123',
              snippet: {
                title: 'Test Video',
                description: 'Test description',
                thumbnails: {
                  high: { url: 'https://example.com/thumb.jpg' },
                },
                channelTitle: 'Test Channel',
              },
            },
          ],
        },
      };

      const { google } = require('googleapis');
      const mockYoutube = google.youtube();
      mockYoutube.videos.list.mockResolvedValue(mockVideo);

      const result = await youtubeService.getVideoById('test123');
      
      expect(result).toBeDefined();
      expect(result.id).toBe('test123');
    });

    it('should handle video not found', async () => {
      const { google } = require('googleapis');
      const mockYoutube = google.youtube();
      mockYoutube.videos.list.mockResolvedValue({ data: { items: [] } });

      await expect(youtubeService.getVideoById('invalid')).rejects.toThrow('Video not found');
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from standard URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const id = youtubeService.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const id = youtubeService.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const id = youtubeService.extractVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      const id = youtubeService.extractVideoId(url);
      expect(id).toBeNull();
    });
  });
});

