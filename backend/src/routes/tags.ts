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
 * GET /api/tags
 * Get all unique tags (for autocomplete/suggestions)
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit = '50' } = req.query;

    // Get distinct tag names with usage count
    const { data, error } = await supabase
      .from('video_tags')
      .select('tag_name')
      .limit(parseInt(limit as string));

    if (error) {
      throw new AppError(error.message, 500);
    }

    // Count occurrences and sort by popularity
    const tagCounts: { [key: string]: number } = {};
    data?.forEach((item) => {
      tagCounts[item.tag_name] = (tagCounts[item.tag_name] || 0) + 1;
    });

    const popularTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json(popularTags);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tags/playlist/:playlistId
 * Get tags for a playlist's videos
 */
router.get('/playlist/:playlistId', async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const { data, error } = await supabase
      .from('video_tags')
      .select('*')
      .eq('playlist_id', playlistId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tags
 * Add tag to a video in a playlist
 */
router.post('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId, videoId, tagName } = req.body;
    const userId = req.user!.id;

    if (!playlistId || !videoId || !tagName) {
      throw new AppError('Playlist ID, video ID, and tag name are required', 400);
    }

    if (tagName.trim().length === 0) {
      throw new AppError('Tag name cannot be empty', 400);
    }

    if (tagName.length > 50) {
      throw new AppError('Tag name must be 50 characters or less', 400);
    }

    // Check playlist ownership
    const { data: playlist } = await supabase
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (!playlist) {
      throw new AppError('Playlist not found or unauthorized', 404);
    }

    // Check if video is in playlist
    const { data: playlistVideo } = await supabase
      .from('playlist_videos')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId)
      .single();

    if (!playlistVideo) {
      throw new AppError('Video not in playlist', 404);
    }

    // Check if tag already exists
    const { data: existing } = await supabase
      .from('video_tags')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId)
      .eq('tag_name', tagName.trim().toLowerCase())
      .single();

    if (existing) {
      throw new AppError('Tag already exists for this video', 409);
    }

    // Add tag
    const { data, error } = await supabase
      .from('video_tags')
      .insert({
        playlist_id: playlistId,
        video_id: videoId,
        tag_name: tagName.trim().toLowerCase(),
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Failed to create tag', { error, userId, playlistId, videoId });
      throw new AppError(error.message, 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tags/:tagId
 * Remove tag
 */
router.delete('/:tagId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { tagId } = req.params;
    const userId = req.user!.id;

    // Check if user owns the playlist
    const { data: tag } = await supabase
      .from('video_tags')
      .select('playlist_id')
      .eq('id', tagId)
      .single();

    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    const { data: playlist } = await supabase
      .from('playlists')
      .select('id')
      .eq('id', tag.playlist_id)
      .eq('user_id', userId)
      .single();

    if (!playlist) {
      throw new AppError('Unauthorized', 403);
    }

    const { error } = await supabase
      .from('video_tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

