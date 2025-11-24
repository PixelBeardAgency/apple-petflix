export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

// Profile is an alias for User (used in some contexts)
export type Profile = User;

export interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  vote_count?: number;
  user?: User;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id?: string;
  text: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  videos?: Video[];
  video_count?: number;
  thumbnail_url?: string | null;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

