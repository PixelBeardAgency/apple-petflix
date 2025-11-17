import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth';
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
 * GET /api/moderation/reports
 * Get all video reports (admin only)
 */
router.get('/reports', authenticateUser, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '50', offset = '0', status = 'pending' } = req.query;

    let query = supabase
      .from('video_reports')
      .select(
        `
        *,
        user:profiles!user_id(id, username),
        video:videos(id, title, thumbnail_url, user_id)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      reports: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/moderation/reports/:reportId
 * Update report status (resolve, dismiss, etc.) - admin only
 */
router.put('/reports/:reportId', authenticateUser, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, resolution_notes } = req.body;
    const userId = req.user!.id;

    if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const { data, error } = await supabase
      .from('video_reports')
      .update({
        status,
        resolution_notes: resolution_notes || null,
        resolved_by: status !== 'pending' ? userId : null,
        resolved_at: status !== 'pending' ? new Date().toISOString() : null,
      })
      .eq('id', reportId)
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError('Report not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/moderation/stats
 * Get moderation statistics - admin only
 */
router.get('/stats', authenticateUser, requireAdmin, async (_req: AuthRequest, res, next) => {
  try {
    // Get pending reports count
    const { count: pendingCount } = await supabase
      .from('video_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total videos count
    const { count: totalVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total comments count
    const { count: totalComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    res.json({
      pendingReports: pendingCount || 0,
      totalVideos: totalVideos || 0,
      totalUsers: totalUsers || 0,
      totalComments: totalComments || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

