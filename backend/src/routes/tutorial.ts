import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * GET /api/tutorial/status
 * Get current user's tutorial status
 */
router.get('/status', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('tutorial_completed, tutorial_skipped')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Failed to get tutorial status', 500);
    }

    res.json({
      completed: data.tutorial_completed || false,
      skipped: data.tutorial_skipped || false,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutorial/complete
 * Mark tutorial as completed
 */
router.post('/complete', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { error } = await supabase
      .from('profiles')
      .update({
        tutorial_completed: true,
        tutorial_skipped: false,
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to update tutorial status', 500);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutorial/skip
 * Mark tutorial as skipped
 */
router.post('/skip', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { error } = await supabase
      .from('profiles')
      .update({
        tutorial_skipped: true,
        tutorial_completed: false,
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to update tutorial status', 500);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tutorial/reset
 * Reset tutorial status (for testing or if user wants to see it again)
 */
router.post('/reset', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { error } = await supabase
      .from('profiles')
      .update({
        tutorial_completed: false,
        tutorial_skipped: false,
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to reset tutorial status', 500);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

