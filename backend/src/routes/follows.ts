import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, AuthRequest } from '../middleware/auth';
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
 * POST /api/users/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user!.id;

    if (userId === followerId) {
      throw new AppError('You cannot follow yourself', 400);
    }

    // Check if user exists
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', userId)
      .single();

    if (existing) {
      throw new AppError('Already following this user', 409);
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: userId,
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Failed to follow user', { error, followerId, userId });
      throw new AppError(error.message, 500);
    }

    // Create notification for the followed user
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', followerId)
      .single();

    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'follow',
      content: `New follower`,
      related_user_id: followerId,
    });

    if (notificationError) {
      logger.error('Failed to create notification for follow', {
        error: notificationError,
        userId,
        followerId,
      });
      // Don't throw - notification failure shouldn't block the follow
    } else {
      logger.info(`Created follow notification for user ${userId} from ${followerId}`);
    }

    // Send push notification
    sendPushNotification(
      userId,
      'New Follower',
      `${followerProfile?.username || 'Someone'} started following you!`,
      '/profile',
      'follow'
    );

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:userId/follow
 * Unfollow a user
 */
router.delete('/:userId/follow', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user!.id;

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', userId);

    if (error) {
      logger.error('Failed to unfollow user', { error, followerId, userId });
      throw new AppError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/followers
 * Get a user's followers
 */
router.get('/:userId/followers', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const { data, error, count } = await supabase
      .from('followers')
      .select(
        `
        follower:profiles!follower_id(id, username, profile_picture_url),
        created_at
      `,
        { count: 'exact' }
      )
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      followers: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/following
 * Get users that a user is following
 */
router.get('/:userId/following', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const { data, error, count } = await supabase
      .from('followers')
      .select(
        `
        following:profiles!following_id(id, username, profile_picture_url),
        created_at
      `,
        { count: 'exact' }
      )
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      following: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/follow-status
 * Check if current user follows the specified user
 */
router.get('/:userId/follow-status', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    const { data } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single();

    res.json({
      isFollowing: !!data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

