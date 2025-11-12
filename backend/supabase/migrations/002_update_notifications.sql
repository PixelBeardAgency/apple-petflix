-- Update notifications table structure to support Phase 4 features
-- This migration adds support for related users and videos

ALTER TABLE notifications 
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS message,
  DROP COLUMN IF EXISTS link;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT 'New notification',
  ADD COLUMN IF NOT EXISTS related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS related_video_id UUID REFERENCES videos(id) ON DELETE CASCADE;

-- Add indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_notifications_related_user ON notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_video ON notifications(related_video_id);

