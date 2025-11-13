-- Add notification preference columns to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_follows BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_videos BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_notifications 
ON profiles(notification_follows, notification_comments, notification_videos);

-- Comment on columns
COMMENT ON COLUMN profiles.notification_follows IS 'User wants push notifications for new followers';
COMMENT ON COLUMN profiles.notification_comments IS 'User wants push notifications for new comments';
COMMENT ON COLUMN profiles.notification_videos IS 'User wants push notifications for new videos from followed users';

