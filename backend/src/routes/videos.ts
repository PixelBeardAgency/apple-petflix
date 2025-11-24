import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, optionalAuth, AuthRequest } from '../middleware/auth';
import { videoSharingLimiter } from '../middleware/rateLimit';
import { AppError } from '../middleware/errorHandler';
import { youtubeService } from '../services/youtube';
import { logger } from '../services/logger';
import { sendPushNotification } from './push';

const router = Router();

// Create Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase credentials', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
  });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * POST /api/videos
 * Share a new video
 */
router.post('/', authenticateUser, videoSharingLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { youtubeUrl, title, description } = req.body;
    const userId = req.user!.id;

    if (!youtubeUrl) {
      throw new AppError('YouTube URL is required', 400);
    }

    // Validate YouTube URL
    const validation = youtubeService.isValidYouTubeUrl(youtubeUrl);
    if (!validation.valid || !validation.videoId) {
      throw new AppError('Invalid YouTube URL', 400);
    }

    // Get video details from YouTube
    const youtubeVideo = await youtubeService.getVideoDetails(validation.videoId);
    if (!youtubeVideo) {
      throw new AppError('Video not found on YouTube', 404);
    }

    // Check if user already shared this video
    const { data: existing } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', validation.videoId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new AppError('You have already shared this video', 409);
    }

    // Create video record
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: validation.videoId,
        title: title || youtubeVideo.snippet?.title || 'Untitled',
        description: description || youtubeVideo.snippet?.description || '',
        thumbnail_url: youtubeVideo.snippet?.thumbnails?.high?.url || youtubeVideo.snippet?.thumbnails?.medium?.url,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Failed to insert video', {
        error,
        userId,
        videoId: validation.videoId,
      });
      throw new AppError(error.message, 500);
    }

    // Get followers of the video creator
    try {
      const { data: followers } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', userId);

      // Get user's username for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      // Create notifications and send push notifications to all followers
      if (followers && followers.length > 0 && userProfile) {
        const notifications = followers.map(follower => ({
          user_id: follower.follower_id,
          type: 'video' as const,
          message: `${userProfile.username} shared a new video: ${video.title}`,
          related_video_id: video.id,
          related_user_id: userId,
        }));

        // Insert notifications
        await supabase.from('notifications').insert(notifications);

        // Send push notifications
        followers.forEach(follower => {
          sendPushNotification(
            follower.follower_id,
            'New Video',
            `${userProfile.username} shared: ${video.title}`,
            `/video/${video.id}`,
            'video'
          ).catch(err => {
            logger.error('Failed to send push notification for new video:', err);
          });
        });

        logger.info(`Created notifications for ${followers.length} followers for video ${video.id}`);
      }
    } catch (notificationError) {
      // Log but don't fail the video creation
      logger.error('Failed to create notifications for new video:', notificationError);
    }

    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/videos/:videoId
 * Get video details
 */
router.get('/:videoId', optionalAuth, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        *,
        user:profiles(id, username, profile_picture_url)
      `)
      .eq('id', videoId)
      .single();

    if (error || !video) {
      throw new AppError('Video not found', 404);
    }

    res.json(video);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/videos/user/:userId
 * Get all videos shared by a specific user
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: videos, error, count } = await supabase
      .from('videos')
      .select(`
        *,
        user:profiles(id, username, profile_picture_url)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      videos: videos || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/videos/:videoId
 * Update video (title, description)
 */
router.put('/:videoId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const userId = req.user!.id;

    // Check ownership
    const { data: video } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (video.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Update video
    const { data: updated, error } = await supabase
      .from('videos')
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select('*')
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/videos/:videoId
 * Delete video
 */
router.delete('/:videoId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const { data: video } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (video.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Delete video
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/videos/:videoId/report
 * Report a video
 */
router.post('/:videoId/report', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    if (!reason) {
      throw new AppError('Report reason is required', 400);
    }

    const validReasons = ['hate_speech', 'inappropriate', 'spam', 'violence', 'other'];
    if (!validReasons.includes(reason)) {
      throw new AppError('Invalid report reason', 400);
    }

    // Check if video exists
    const { data: video } = await supabase
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Check if already reported by this user
    const { data: existing } = await supabase
      .from('video_reports')
      .select('id')
      .eq('video_id', videoId)
      .eq('reporter_id', userId)
      .eq('reason', reason)
      .single();

    if (existing) {
      throw new AppError('You have already reported this video for this reason', 409);
    }

    // Create report
    const { data: report, error } = await supabase
      .from('video_reports')
      .insert({
        video_id: videoId,
        reporter_id: userId,
        reason,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/videos/:videoId/vote
 * Vote on a video (upvote or downvote)
 */
router.post('/:videoId/vote', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const { voteType } = req.body;
    const userId = req.user!.id;

    // Validate vote type
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      throw new AppError('Vote type must be either "upvote" or "downvote"', 400);
    }

    // Check if video exists
    const { data: video } = await supabase
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('video_votes')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Update existing vote
      const { data: updated, error } = await supabase
        .from('video_votes')
        .update({ vote_type: voteType })
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        throw new AppError(error.message, 500);
      }

      res.json({
        message: 'Vote updated',
        vote: updated,
      });
    } else {
      // Create new vote
      const { data: newVote, error } = await supabase
        .from('video_votes')
        .insert({
          video_id: videoId,
          user_id: userId,
          vote_type: voteType,
        })
        .select('*')
        .single();

      if (error) {
        throw new AppError(error.message, 500);
      }

      res.status(201).json({
        message: 'Vote recorded',
        vote: newVote,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/videos/:videoId/vote
 * Remove vote from a video
 */
router.delete('/:videoId/vote', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user!.id;

    // Delete vote
    const { error } = await supabase
      .from('video_votes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({ message: 'Vote removed' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/videos/:videoId/vote
 * Get current user's vote on a video
 */
router.get('/:videoId/vote', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user!.id;

    const { data: vote } = await supabase
      .from('video_votes')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    res.json({ vote: vote || null });
  } catch (error) {
    next(error);
  }
});

export default router;

