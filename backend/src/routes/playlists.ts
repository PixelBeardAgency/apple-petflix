import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser, AuthRequest, optionalAuth } from '../middleware/auth';
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
 * GET /api/playlists
 * Get user's playlists
 */
router.get('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = '20', offset = '0' } = req.query;

    const { data, error, count } = await supabase
      .from('playlists')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      playlists: data,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/playlists/:playlistId
 * Get playlist details with videos
 */
router.get('/:playlistId', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId } = req.params;
    const currentUserId = req.user?.id;

    // Get playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlist) {
      throw new AppError('Playlist not found', 404);
    }

    // Check if user can view playlist
    if (!playlist.is_public && playlist.user_id !== currentUserId) {
      throw new AppError('Unauthorized', 403);
    }

    // Get videos in playlist
    const { data: playlistVideos, error: videosError } = await supabase
      .from('playlist_videos')
      .select(
        `
        *,
        video:videos(
          *,
          user:profiles!user_id(id, username, profile_picture_url)
        )
      `
      )
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (videosError) {
      throw new AppError(videosError.message, 500);
    }

    res.json({
      ...playlist,
      videos: playlistVideos?.map((pv) => pv.video) || [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/playlists
 * Create a new playlist
 */
router.post('/', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { name, description, is_public = true } = req.body;
    const userId = req.user!.id;

    if (!name || name.trim().length === 0) {
      throw new AppError('Playlist name is required', 400);
    }

    if (name.length > 100) {
      throw new AppError('Playlist name must be 100 characters or less', 400);
    }

    if (description && description.length > 500) {
      throw new AppError('Description must be 500 characters or less', 400);
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        is_public,
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Failed to create playlist', { error, userId });
      throw new AppError(error.message, 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/playlists/:playlistId
 * Update playlist
 */
router.put('/:playlistId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId } = req.params;
    const { name, description, is_public } = req.body;
    const userId = req.user!.id;

    const updates: any = { updated_at: new Date().toISOString() };

    if (name !== undefined) {
      if (name.trim().length === 0) {
        throw new AppError('Playlist name cannot be empty', 400);
      }
      if (name.length > 100) {
        throw new AppError('Playlist name must be 100 characters or less', 400);
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (description && description.length > 500) {
        throw new AppError('Description must be 500 characters or less', 400);
      }
      updates.description = description?.trim() || null;
    }

    if (is_public !== undefined) {
      updates.is_public = is_public;
    }

    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', playlistId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError('Playlist not found or unauthorized', 404);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/playlists/:playlistId
 * Delete playlist
 */
router.delete('/:playlistId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', userId);

    if (error) {
      throw new AppError('Playlist not found or unauthorized', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/playlists/:playlistId/videos
 * Add video to playlist
 */
router.post('/:playlistId/videos', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId } = req.params;
    const { videoId } = req.body;
    const userId = req.user!.id;

    if (!videoId) {
      throw new AppError('Video ID is required', 400);
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

    // Check if video exists
    const { data: video } = await supabase
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Check if video already in playlist
    const { data: existing } = await supabase
      .from('playlist_videos')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId)
      .single();

    if (existing) {
      throw new AppError('Video already in playlist', 409);
    }

    // Get max position
    const { data: maxPos } = await supabase
      .from('playlist_videos')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position || 0) + 1;

    // Add video to playlist
    const { data, error } = await supabase
      .from('playlist_videos')
      .insert({
        playlist_id: playlistId,
        video_id: videoId,
        position,
      })
      .select('*')
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/playlists/:playlistId/videos/:videoId
 * Remove video from playlist
 */
router.delete('/:playlistId/videos/:videoId', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const { playlistId, videoId } = req.params;
    const userId = req.user!.id;

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

    const { error } = await supabase
      .from('playlist_videos')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

