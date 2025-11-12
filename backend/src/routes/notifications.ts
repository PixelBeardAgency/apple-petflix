import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

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
 * GET /api/notifications
 * Get current user's notifications
 */
router.get('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = '20', offset = '0', unreadOnly = 'false' } = req.query;

    let query = supabase
      .from('notifications')
      .select(
        `
        *,
        related_user:profiles!related_user_id(id, username, profile_picture_url),
        related_video:videos!related_video_id(id, title, thumbnail_url)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('read', false);
    }

    const { data, error, count } = await query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      notifications: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * Mark a notification as read
 */
router.put('/:notificationId/read', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    // Check ownership
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Mark as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select('*')
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({ count: count || 0 });
  } catch (error) {
    next(error);
  }
});

export default router;

