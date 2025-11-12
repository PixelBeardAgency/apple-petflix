import rateLimit from 'express-rate-limit';

// YouTube search rate limiter: 20 requests per minute per user
export const youtubeSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Video sharing rate limiter: 10 videos per hour per user
export const videoSharingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'You can only share 10 videos per hour. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Comment rate limiter: 30 comments per hour per user
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: 'Too many comments, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

