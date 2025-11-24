-- Migration: Video Upvoting System
-- Description: Add upvote/downvote functionality for videos
-- Created: 2025-11-24

-- Create video_votes table
CREATE TABLE IF NOT EXISTS video_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_votes_video_id ON video_votes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_votes_user_id ON video_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_votes_created_at ON video_votes(created_at DESC);

-- Add vote_count column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Create function to calculate vote count for a video
CREATE OR REPLACE FUNCTION calculate_video_vote_count(p_video_id UUID)
RETURNS INTEGER AS $$
DECLARE
  upvotes INTEGER;
  downvotes INTEGER;
BEGIN
  -- Count upvotes
  SELECT COUNT(*) INTO upvotes
  FROM video_votes
  WHERE video_id = p_video_id AND vote_type = 'upvote';
  
  -- Count downvotes
  SELECT COUNT(*) INTO downvotes
  FROM video_votes
  WHERE video_id = p_video_id AND vote_type = 'downvote';
  
  -- Return net vote count (upvotes - downvotes)
  RETURN upvotes - downvotes;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update vote_count when votes change
CREATE OR REPLACE FUNCTION update_video_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE videos
    SET vote_count = calculate_video_vote_count(NEW.video_id)
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos
    SET vote_count = calculate_video_vote_count(OLD.video_id)
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_video_vote_count ON video_votes;
CREATE TRIGGER trigger_update_video_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON video_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_vote_count();

-- Enable RLS (Row Level Security)
ALTER TABLE video_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_votes
CREATE POLICY "Users can view all votes"
  ON video_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON video_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON video_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON video_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Initialize vote_count for existing videos
UPDATE videos
SET vote_count = calculate_video_vote_count(id)
WHERE vote_count IS NULL OR vote_count = 0;

-- Add comment
COMMENT ON TABLE video_votes IS 'Stores user votes (upvote/downvote) for videos';
COMMENT ON COLUMN video_votes.vote_type IS 'Type of vote: upvote or downvote';
COMMENT ON COLUMN videos.vote_count IS 'Net vote count (upvotes - downvotes)';

