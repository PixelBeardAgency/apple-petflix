import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, optionalAuth, AuthRequest } from '../middleware/auth';
import { commentLimiter } from '../middleware/rateLimit';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../services/logger';
import { sendPushNotification } from './push';

const router = Router();

// Create Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * GET /api/comments/video/:videoId
 * Get comments for a video
 */
router.get('/video/:videoId', optionalAuth, async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const { data, error, count } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:profiles!user_id(id, username, profile_picture_url)
      `,
        { count: 'exact' }
      )
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      comments: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/comments
 * Create a new comment
 */
router.post('/', authenticateUser, commentLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { videoId, text } = req.body;
    const userId = req.user!.id;

    if (!videoId || !text) {
      throw new AppError('Video ID and comment text are required', 400);
    }

    if (text.trim().length === 0) {
      throw new AppError('Comment cannot be empty', 400);
    }

    if (text.length > 500) {
      throw new AppError('Comment must be 500 characters or less', 400);
    }

    // Check if video exists
    const { data: video } = await supabase
      .from('videos')
      .select('id, user_id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        video_id: videoId,
        user_id: userId,
        text: text.trim(),
      })
      .select(
        `
        *,
        user:profiles!user_id(id, username, profile_picture_url)
      `
      )
      .single();

    if (error) {
      logger.error('Failed to create comment', { error, userId, videoId });
      throw new AppError(error.message, 500);
    }

    // Create notification for video owner (if not commenting on own video)
    if (video.user_id !== userId) {
      const { data: commenterProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      const { data: videoData } = await supabase
        .from('videos')
        .select('title')
        .eq('id', videoId)
        .single();

      await supabase.from('notifications').insert({
        user_id: video.user_id,
        type: 'comment',
        content: `New comment on your video`,
        related_user_id: userId,
        related_video_id: videoId,
      });

      // Send push notification
      sendPushNotification(
        video.user_id,
        'New Comment',
        `${commenterProfile?.username || 'Someone'} commented on your video "${videoData?.title || 'your video'}"`,
        `/video/${videoId}`,
        'comment'
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/comments/:commentId
 * Update a comment
 */
router.put('/:commentId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user!.id;

    if (!text) {
      throw new AppError('Comment text is required', 400);
    }

    if (text.trim().length === 0) {
      throw new AppError('Comment cannot be empty', 400);
    }

    if (text.length > 500) {
      throw new AppError('Comment must be 500 characters or less', 400);
    }

    // Check ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Update comment
    const { data: updated, error } = await supabase
      .from('comments')
      .update({
        text: text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        *,
        user:profiles!user_id(id, username, profile_picture_url)
      `
      )
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
 * DELETE /api/comments/:commentId
 * Delete a comment
 */
router.delete('/:commentId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Delete comment
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

