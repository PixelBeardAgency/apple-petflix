export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id?: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  created_at: string;
}

export interface VideoReport {
  id: string;
  video_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

