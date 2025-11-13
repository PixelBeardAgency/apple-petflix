import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Key generator function to track by user ID if authenticated, otherwise by IP
const getUserKey = (req: Request): string => {
  // Check for authenticated user
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  // Fall back to IP address
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
};

// Global rate limiter: 200 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Authentication rate limiter: 5 attempts per 15 minutes (stricter for security)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// YouTube search rate limiter: 30 requests per minute per user
export const youtubeSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Video sharing rate limiter: 15 videos per hour per user
export const videoSharingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: 'You can only share 15 videos per hour. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Comment rate limiter: 50 comments per hour per user
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many comments, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Follow/Unfollow rate limiter: 30 actions per hour per user
export const followLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: 'Too many follow/unfollow actions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Playlist creation rate limiter: 10 playlists per hour per user
export const playlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many playlist creations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

// Moderation actions rate limiter: 50 actions per hour per moderator
export const moderationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many moderation actions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
});

