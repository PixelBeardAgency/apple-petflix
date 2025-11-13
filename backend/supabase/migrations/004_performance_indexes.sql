-- Performance Optimization Indexes Migration
-- This migration adds indexes to improve query performance

-- ============================================
-- VIDEOS TABLE INDEXES
-- ============================================

-- Index for fetching videos by user (used in profile pages)
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);

-- Index for sorting videos by creation date (used in feed)
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Composite index for user videos sorted by date
CREATE INDEX IF NOT EXISTS idx_videos_user_created ON videos(user_id, created_at DESC);

-- Index for YouTube video ID lookups (prevent duplicate shares)
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_video_id);

-- ============================================
-- COMMENTS TABLE INDEXES
-- ============================================

-- Index for fetching comments by video (most common query)
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);

-- Index for fetching comments by user
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Composite index for video comments sorted by date
CREATE INDEX IF NOT EXISTS idx_comments_video_created ON comments(video_id, created_at DESC);

-- ============================================
-- FOLLOWS TABLE INDEXES
-- ============================================

-- Index for checking if user follows another user
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(follower_id, following_id);

-- Index for getting all followers of a user
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Index for getting all users a user is following
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);

-- ============================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================

-- Composite index for fetching user notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Index for notification type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================
-- PLAYLISTS TABLE INDEXES
-- ============================================

-- Index for fetching playlists by user
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);

-- Index for public playlists discovery
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON playlists(is_public) WHERE is_public = true;

-- Composite index for user playlists sorted by update
CREATE INDEX IF NOT EXISTS idx_playlists_user_updated ON playlists(user_id, updated_at DESC);

-- ============================================
-- PLAYLIST_VIDEOS TABLE INDEXES
-- ============================================

-- Index for fetching videos in a playlist
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist ON playlist_videos(playlist_id, position);

-- Index for checking if video is in playlist
CREATE INDEX IF NOT EXISTS idx_playlist_videos_video ON playlist_videos(video_id);

-- ============================================
-- VIDEO_TAGS TABLE INDEXES
-- ============================================

-- Index for fetching videos by tag
CREATE INDEX IF NOT EXISTS idx_video_tags_tag ON video_tags(tag_id);

-- Index for fetching tags by video
CREATE INDEX IF NOT EXISTS idx_video_tags_video ON video_tags(video_id);

-- ============================================
-- TAGS TABLE INDEXES
-- ============================================

-- Index for tag name lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_tags_name_lower ON tags(LOWER(name));

-- ============================================
-- MODERATION_ACTIONS TABLE INDEXES
-- ============================================

-- Index for fetching moderation actions by video
CREATE INDEX IF NOT EXISTS idx_moderation_video_id ON moderation_actions(video_id);

-- Index for fetching moderation actions by moderator
CREATE INDEX IF NOT EXISTS idx_moderation_moderator_id ON moderation_actions(moderator_id);

-- Index for recent moderation actions
CREATE INDEX IF NOT EXISTS idx_moderation_created_at ON moderation_actions(created_at DESC);

-- ============================================
-- PUSH_SUBSCRIPTIONS TABLE INDEXES
-- ============================================

-- Index for user push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- ============================================
-- ANALYZE TABLES (Update statistics)
-- ============================================

ANALYZE videos;
ANALYZE comments;
ANALYZE follows;
ANALYZE notifications;
ANALYZE playlists;
ANALYZE playlist_videos;
ANALYZE video_tags;
ANALYZE tags;
ANALYZE moderation_actions;
ANALYZE push_subscriptions;

-- ============================================
-- VACUUM (Reclaim storage and optimize)
-- ============================================

-- Note: VACUUM ANALYZE should be run periodically by a scheduled job
-- This is just a reminder and may need to be run manually

-- ============================================
-- Query Performance Tips
-- ============================================

-- Use EXPLAIN ANALYZE to check query performance:
-- EXPLAIN ANALYZE SELECT * FROM videos WHERE user_id = 'uuid';

-- Monitor index usage:
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan ASC;

-- Check table sizes:
-- SELECT schemaname, tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

