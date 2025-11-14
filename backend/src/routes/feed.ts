import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../services/logger';

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
 * GET /api/feed
 * Get personalized feed (videos from users you follow)
 */
router.get('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = '20', offset = '0' } = req.query;

    logger.info(`Fetching feed for user ${userId}`);

    // Get list of users the current user follows
    const { data: following, error: followError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) {
      logger.error('Error fetching following list:', followError);
      throw new AppError(`Database error: ${followError.message}`, 500);
    }

    if (!following || following.length === 0) {
      logger.info(`User ${userId} is not following anyone`);
      // No following, return empty feed
      return res.json({
        videos: [],
        total: 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    }

    const followingIds = following.map((f) => f.following_id);
    logger.info(`User ${userId} follows ${followingIds.length} users`);

    // Get videos from followed users
    const { data, error, count } = await supabase
      .from('videos')
      .select(
        `
        *,
        user:profiles!user_id(id, username, profile_picture_url)
      `,
        { count: 'exact' }
      )
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      logger.error('Error fetching videos:', error);
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    logger.info(`Found ${data?.length || 0} videos for user ${userId}`);

    res.json({
      videos: data || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Feed route error:', error);
    next(error);
  }
});

export default router;

