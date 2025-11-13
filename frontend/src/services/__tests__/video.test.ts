import { videoService } from '../video';

// Mock fetch
global.fetch = jest.fn();

describe('Video Service', () => {
  const mockToken = 'test-token-123';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('shareVideo', () => {
    it('should share a video successfully', async () => {
      const mockResponse = {
        id: 'video-123',
        youtube_video_id: 'abc123',
        title: 'Cute Cat Video',
        description: 'A cute cat playing',
        thumbnail_url: 'https://example.com/thumb.jpg',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await videoService.shareVideo(
        mockToken,
        'https://youtube.com/watch?v=abc123'
      );

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/videos`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle share errors', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid video URL' }),
      });

      await expect(
        videoService.shareVideo(mockToken, 'invalid-url')
      ).rejects.toThrow('Invalid video URL');
    });
  });

  describe('getVideo', () => {
    it('should get video by ID', async () => {
      const mockVideo = {
        id: 'video-123',
        title: 'Test Video',
        youtube_video_id: 'abc123',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await videoService.getVideo(mockToken, 'video-123');

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/videos/video-123`,
        expect.any(Object)
      );
      expect(result).toEqual(mockVideo);
    });

    it('should handle video not found', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Video not found' }),
      });

      await expect(
        videoService.getVideo(mockToken, 'invalid-id')
      ).rejects.toThrow('Video not found');
    });
  });

  describe('deleteVideo', () => {
    it('should delete video successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Video deleted' }),
      });

      await videoService.deleteVideo(mockToken, 'video-123');

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/videos/video-123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('reportVideo', () => {
    it('should report video successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Video reported' }),
      });

      await videoService.reportVideo(mockToken, 'video-123', 'spam');

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/videos/video-123/report`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('spam'),
        })
      );
    });
  });
});

