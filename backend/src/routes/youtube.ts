import { Router } from 'express';
import { youtubeService } from '../services/youtube';
import { optionalAuth } from '../middleware/auth';
import { youtubeSearchLimiter } from '../middleware/rateLimit';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/youtube/search
 * Search for YouTube videos
 * Query params: q (search term), maxResults, order
 */
router.get('/search', optionalAuth, youtubeSearchLimiter, async (req, res, next) => {
  try {
    const { q, maxResults = '10', order = 'relevance' } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    const validOrders = ['relevance', 'date', 'viewCount', 'rating'];
    const searchOrder = validOrders.includes(order as string) 
      ? (order as 'relevance' | 'date' | 'viewCount' | 'rating')
      : 'relevance';

    const max = Math.min(parseInt(maxResults as string, 10) || 10, 50);

    const results = await youtubeService.searchVideos(q, max, searchOrder);

    // Transform results to a cleaner format
    const videos = results.map((item) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
    }));

    res.json({
      videos,
      count: videos.length,
      query: q,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/youtube/video/:videoId
 * Get details for a specific YouTube video
 */
router.get('/video/:videoId', optionalAuth, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      throw new AppError('Video ID is required', 400);
    }

    const video = await youtubeService.getVideoDetails(videoId);

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Transform to cleaner format
    const videoData = {
      id: video.id || '',
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
      channelTitle: video.snippet?.channelTitle || '',
      publishedAt: video.snippet?.publishedAt || '',
      viewCount: video.statistics?.viewCount || '0',
      likeCount: video.statistics?.likeCount || '0',
      duration: video.contentDetails?.duration || '',
    };

    res.json(videoData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/youtube/trending
 * Get trending pet videos
 */
router.get('/trending', optionalAuth, async (req, res, next) => {
  try {
    const { maxResults = '20' } = req.query;
    const max = Math.min(parseInt(maxResults as string, 10) || 20, 50);

    const results = await youtubeService.getTrendingVideos(max);

    const videos = results.map((item) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
    }));

    res.json({
      videos,
      count: videos.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/youtube/validate
 * Validate a YouTube URL and extract video ID
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      throw new AppError('URL is required', 400);
    }

    const validation = youtubeService.isValidYouTubeUrl(url);

    if (!validation.valid) {
      res.json({
        valid: false,
        message: 'Invalid YouTube URL',
      });
      return;
    }

    // Get video details to confirm it exists
    const video = await youtubeService.getVideoDetails(validation.videoId!);

    if (!video) {
      res.json({
        valid: false,
        message: 'Video not found or unavailable',
      });
      return;
    }

    res.json({
      valid: true,
      videoId: validation.videoId,
      video: {
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
        channelTitle: video.snippet?.channelTitle || '',
        publishedAt: video.snippet?.publishedAt || '',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/youtube/quota
 * Get current YouTube API quota usage (admin only for now)
 */
router.get('/quota', async (_req, res, next) => {
  try {
    const quotaInfo = youtubeService.getQuotaUsage();
    res.json(quotaInfo);
  } catch (error) {
    next(error);
  }
});

export default router;

