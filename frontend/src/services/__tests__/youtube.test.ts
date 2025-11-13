import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchYouTubeVideos, getYouTubeVideoId } from '../youtube';

describe('YouTube Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getYouTubeVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from youtu.be short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxxx&index=1';
      expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from mobile YouTube URL', () => {
      const url = 'https://m.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      expect(getYouTubeVideoId('https://example.com')).toBeNull();
      expect(getYouTubeVideoId('not a url')).toBeNull();
      expect(getYouTubeVideoId('')).toBeNull();
    });

    it('should handle malformed URLs gracefully', () => {
      expect(getYouTubeVideoId('https://youtube.com')).toBeNull();
      expect(getYouTubeVideoId('https://www.youtube.com/watch')).toBeNull();
    });
  });

  describe('searchYouTubeVideos', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should search for videos', async () => {
      const mockResponse = {
        items: [
          {
            id: { videoId: 'test123' },
            snippet: {
              title: 'Test Video',
              description: 'Test Description',
              thumbnails: {
                medium: { url: 'https://example.com/thumb.jpg' },
              },
              channelTitle: 'Test Channel',
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchYouTubeVideos('cats');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('youtube.googleapis.com/youtube/v3/search')
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test123');
      expect(results[0].title).toBe('Test Video');
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(searchYouTubeVideos('test')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(searchYouTubeVideos('test')).rejects.toThrow('Network error');
    });

    it('should include query parameters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await searchYouTubeVideos('dogs', 20);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=dogs')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=20')
      );
    });

    it('should filter by category (pets)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await searchYouTubeVideos('animals');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('videoCategoryId=15') // Pets & Animals
      );
    });
  });
});

