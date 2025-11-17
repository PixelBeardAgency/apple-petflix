import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './services/logger';

// Import routes
import youtubeRoutes from './routes/youtube';
import videoRoutes from './routes/videos';
import followRoutes from './routes/follows';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import feedRoutes from './routes/feed';
import playlistRoutes from './routes/playlists';
import tagRoutes from './routes/tags';
import moderationRoutes from './routes/moderation';
import pushRoutes from './routes/push';
import profilesRoutes from './routes/profiles';
import tutorialRoutes from './routes/tutorial';
import securityRoutes from './routes/security';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com", "https://www.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      reportUri: "/api/csp-report",
    },
    reportOnly: false,
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Additional security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://applepetflix.vercel.app', // Production Vercel URL
  /https:\/\/.*\.vercel\.app$/, // All Vercel preview deployments
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Body parser with size limits
app.use(express.json({ limit: '1mb' })); // Limit JSON payload to 1MB
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Import global rate limiter
import { globalLimiter } from './middleware/rateLimit';
import { sanitizeBody, preventSQLInjection } from './middleware/validation';
import { performanceMonitoring, getHealthStatus, getMetricsData } from './services/monitoring';

// Apply performance monitoring
app.use(performanceMonitoring);

// Apply global rate limiting
app.use(globalLimiter);

// Apply input sanitization
app.use(sanitizeBody);
app.use(preventSQLInjection);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json(getHealthStatus());
});

// Metrics endpoint (protected - only for monitoring tools)
app.get('/metrics', (_req, res) => {
  // In production, add authentication for this endpoint
  res.status(200).json(getMetricsData());
});

// API routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', followRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/tutorial', tutorialRoutes);
app.use('/api', securityRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server (only if not running in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;

