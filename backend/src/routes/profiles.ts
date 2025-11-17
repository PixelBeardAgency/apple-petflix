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
 * GET /api/profiles/search
 * Search for profiles by username
 */
router.get('/search', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Query parameter is required', 400);
    }

    // Search profiles by username (case-insensitive)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, bio, profile_picture_url')
      .ilike('username', `%${q}%`)
      .limit(20);

    if (error) {
      throw new AppError('Failed to search profiles', 500);
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profiles/:userId
 * Get a specific profile
 */
router.get('/:userId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, bio, profile_picture_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Profile not found', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profiles
 * Update current user's profile
 */
router.patch('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { username, bio, profile_picture_url } = req.body;

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (profile_picture_url !== undefined) updates.profile_picture_url = profile_picture_url;

    if (Object.keys(updates).length === 0) {
      throw new AppError('No updates provided', 400);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, username, bio, profile_picture_url')
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;

