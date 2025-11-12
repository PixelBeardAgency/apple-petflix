# Petflix Architecture Documentation

## Overview

Petflix is a full-stack Progressive Web Application (PWA) for discovering, sharing, and engaging with pet videos from YouTube. The application follows a modern, scalable architecture designed to work within Supabase free tier limits.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom color palette
- **UI Components**: Shadcn UI (Radix UI primitives)
- **State Management**: React Context API + Hooks
- **Routing**: React Router DOM v6
- **PWA**: Vite PWA Plugin + Workbox
- **HTTP Client**: Fetch API with custom wrappers
- **Real-time**: Supabase Realtime subscriptions

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express with TypeScript
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Caching**: node-cache (in-memory)
- **External API**: YouTube Data API v3
- **Push Notifications**: web-push library
- **Logging**: Winston

### Infrastructure
- **Database & Auth**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **API Server**: Express (deployed on Railway/Render/DigitalOcean)
- **Frontend Hosting**: Vercel/Netlify/Cloudflare Pages
- **CDN**: Integrated with hosting provider

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (PWA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Service     │  │   IndexedDB  │     │
│  │  Components  │  │   Worker     │  │   (Offline)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Supabase Client (Auth + Realtime)        │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                  ┌──────────────────┐
│  Express Backend  │                  │     Supabase     │
│  ┌──────────────┐ │                  │  ┌─────────────┐ │
│  │   Routes     │ │                  │  │ PostgreSQL  │ │
│  ├──────────────┤ │◄─────────────────┤  │  Database   │ │
│  │  Middleware  │ │  Service Key     │  ├─────────────┤ │
│  ├──────────────┤ │                  │  │    Auth     │ │
│  │   Services   │ │                  │  ├─────────────┤ │
│  │  - YouTube   │ │                  │  │  Realtime   │ │
│  │  - Push      │ │                  │  ├─────────────┤ │
│  │  - Logger    │ │                  │  │   Storage   │ │
│  └──────────────┘ │                  │  └─────────────┘ │
└──────┬────────────┘                  └──────────────────┘
       │
       │ API Key
       ▼
┌───────────────────┐
│  YouTube Data API │
│       v3          │
└───────────────────┘
```

## Data Flow

### Authentication Flow
1. User registers/logs in via frontend
2. Supabase Auth handles authentication
3. JWT token returned to frontend
4. Token stored in browser (localStorage + session)
5. Token sent with API requests to backend
6. Backend verifies token with Supabase

### Video Sharing Flow
1. User pastes YouTube URL in frontend
2. Frontend validates URL format
3. Request sent to backend API with auth token
4. Backend validates token and YouTube video ID
5. Backend fetches video metadata from YouTube API
6. Video record created in Supabase database
7. Frontend updates UI with new video

### Real-time Updates Flow
1. Frontend subscribes to Supabase Realtime channels
2. User action triggers database change (e.g., new comment)
3. Supabase Realtime broadcasts change
4. All subscribed clients receive update
5. UI updates automatically without page refresh

### Offline Support Flow
1. Service Worker intercepts network requests
2. Cache-first strategy for static assets
3. Network-first strategy for API calls
4. Store video metadata in IndexedDB
5. Display cached data when offline
6. Sync changes when connection restored

## Database Schema

### Core Tables

**profiles**
- Extends Supabase auth.users
- Stores username, bio, profile picture URL
- One-to-one with auth.users

**videos**
- Stores shared YouTube video metadata
- Links to YouTube via youtube_video_id
- Foreign key to profiles (user_id)
- Unique constraint: (youtube_video_id, user_id)

**followers**
- Junction table for user relationships
- Composite primary key (follower_id, following_id)
- Self-referencing foreign keys to profiles
- Check constraint prevents self-following

**comments**
- Threaded comments support via parent_id
- Foreign keys to videos and profiles
- Supports nested replies

**playlists**
- User-created video collections
- Public/private visibility flag
- Foreign key to profiles

**playlist_videos**
- Junction table for playlist-video relationship
- Position field for ordering
- Composite primary key (playlist_id, video_id)

**video_tags**
- Custom tags for videos within playlists
- Unique constraint: (video_id, playlist_id, tag_name)

**notifications**
- In-app notifications
- Links to relevant content
- Read/unread status

**push_subscriptions**
- Web push notification endpoints
- Stores VAPID keys for push service

**video_reports**
- Content moderation system
- Unique constraint prevents duplicate reports

### Indexes

Performance-critical indexes:
- videos(user_id)
- videos(created_at DESC)
- followers(following_id)
- comments(video_id)
- comments(parent_id)
- playlists(user_id)
- notifications(user_id, read)

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**profiles**: Public read, owner update
**videos**: Public read, authenticated create, owner update/delete
**followers**: Public read, owner create/delete
**comments**: Public read, authenticated create, owner update/delete
**playlists**: Public read for public playlists, owner full control
**notifications**: Owner read/update/delete
**push_subscriptions**: Owner full control
**video_reports**: Authenticated create, admin read/update

## API Architecture

### Backend Routes

**YouTube Routes** (`/api/youtube`)
- GET `/search` - Search YouTube videos
- GET `/video/:videoId` - Get video details
- GET `/trending` - Get trending pet videos

**Video Routes** (`/api/videos`)
- POST `/` - Share new video
- GET `/:videoId` - Get video details
- PUT `/:videoId` - Update video
- DELETE `/:videoId` - Delete video
- POST `/:videoId/report` - Report video

**Profile Routes** (`/api/users`)
- GET `/:userId` - Get user profile
- PUT `/:userId` - Update profile
- GET `/:userId/videos` - Get user's videos
- GET `/:userId/followers` - Get followers
- GET `/:userId/following` - Get following

**Follow Routes** (`/api/users/:userId`)
- POST `/follow` - Follow user
- DELETE `/unfollow` - Unfollow user

**Comment Routes** (`/api/comments`)
- POST `/` - Create comment
- GET `/video/:videoId` - Get video comments
- PUT `/:commentId` - Edit comment
- DELETE `/:commentId` - Delete comment
- POST `/:commentId/like` - Like/unlike comment

**Playlist Routes** (`/api/playlists`)
- POST `/` - Create playlist
- GET `/:playlistId` - Get playlist
- PUT `/:playlistId` - Update playlist
- DELETE `/:playlistId` - Delete playlist
- POST `/:playlistId/videos` - Add video
- DELETE `/:playlistId/videos/:videoId` - Remove video

**Feed Routes** (`/api/feed`)
- GET `/` - Get personalized feed

**Moderation Routes** (`/api/moderation`)
- GET `/reports` - Get reported videos (admin)
- PUT `/reports/:reportId` - Update report status (admin)

### Middleware

**authenticateUser**
- Verifies JWT token with Supabase
- Attaches user to request object
- Returns 401 if invalid/expired

**optionalAuth**
- Attaches user if token present
- Continues without auth if no token

**Rate Limiters**
- Global: 100 req/15min per IP
- YouTube search: 20 req/min per user
- Video sharing: 10 videos/hour per user
- Comments: 30 comments/hour per user

**Error Handler**
- Catches all errors
- Logs with context
- Returns user-friendly messages
- Hides sensitive info in production

## Caching Strategy

### Backend Caching
- **YouTube Search**: 5 minutes TTL
- **Video Details**: 1 hour TTL
- **Trending Videos**: 1 hour TTL
- **In-memory cache**: node-cache with configurable TTL

### Frontend Caching
- **Service Worker**: Workbox strategies
  - Static assets: Cache-first
  - API calls: Network-first
  - Images: Cache-first with 30-day expiration
- **IndexedDB**: Video metadata for offline access

## Security Measures

### Authentication & Authorization
- JWT tokens from Supabase Auth
- Row Level Security on all tables
- Token verification on backend routes
- Role-based access control (admin routes)

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- DOMPurify for XSS prevention
- Parameterized queries (via Supabase)

### Rate Limiting
- IP-based global limits
- User-based endpoint limits
- Protection against abuse

### Security Headers
- Helmet.js for Express
- CSP for YouTube embeds
- HSTS enforcement
- CORS restricted to frontend origin

### Data Protection
- HTTPS enforcement
- Secure cookie flags
- No sensitive data in logs
- Environment variables for secrets

## Performance Optimizations

### Frontend
- Code splitting (React.lazy)
- Image lazy loading
- Debounced search input
- Virtual scrolling for long lists
- React.memo for expensive components
- Bundle size optimization

### Backend
- Response caching
- Database indexes
- Connection pooling (Supabase)
- Gzip compression
- Quota management for YouTube API

### Database
- Proper indexes on foreign keys
- Indexes on commonly queried columns
- Efficient query patterns
- Pagination for large result sets

## Scalability Considerations

### Supabase Free Tier Limits
- Database: 500MB (optimize by using YouTube links, not storing videos)
- Bandwidth: 2GB/month (cache aggressively, use CDN)
- Storage: 1GB (profile pictures via URL, not uploads)
- API requests: Unlimited (but rate-limited)

### Scaling Strategy
1. **Database**: Soft delete old videos, pagination everywhere
2. **Bandwidth**: CDN for static assets, image optimization
3. **Storage**: External images only, no file uploads
4. **API**: Caching and rate limiting

### Future Scaling Options
- Upgrade Supabase plan for larger database
- Move static assets to dedicated CDN
- Add Redis for distributed caching
- Implement API gateway for load balancing
- Database read replicas for heavy read operations

## Monitoring & Observability

### Logging
- Winston logger with multiple transports
- Log levels: error, warn, info, debug
- File rotation for log management
- Structured logging (JSON format)

### Error Tracking
- Centralized error handling
- Stack traces in development
- User-friendly messages in production
- Error context (user, endpoint, timestamp)

### Metrics to Track
- API response times
- Database query performance
- YouTube API quota usage
- User engagement metrics
- PWA install rate
- Error rates

### Alerting
- YouTube API quota warnings (80% usage)
- Database size warnings (400MB)
- High error rates
- Performance degradation

## Deployment Architecture

### Frontend Deployment
- Build: `npm run build`
- Output: `dist/` directory
- Hosting: Vercel/Netlify/Cloudflare Pages
- CDN: Automatic via hosting provider
- Environment: Inject via build-time variables

### Backend Deployment
- Build: `npm run build`
- Output: `dist/` directory
- Hosting: Railway/Render/DigitalOcean
- Environment: Runtime variables
- Process manager: PM2 or built-in

### Database Deployment
- Supabase hosted PostgreSQL
- Migrations: Run via Supabase CLI or SQL editor
- Backups: Automatic daily backups
- Point-in-time recovery available

### CI/CD Pipeline
- GitHub Actions for automation
- Run tests on PR
- Build and deploy on merge to main
- Environment-specific deployments

## Development Workflow

### Local Development Setup
1. Install dependencies: `npm install`
2. Configure environment variables
3. Start Supabase project
4. Run database migrations
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`

### Testing Strategy
- Unit tests: Jest
- Component tests: React Testing Library
- E2E tests: Playwright/Cypress
- API tests: Supertest
- Manual testing checklist

### Code Quality
- ESLint for code linting
- Prettier for formatting
- TypeScript for type safety
- Pre-commit hooks (optional)

## Best Practices

### Code Organization
- Feature-based directory structure
- Separation of concerns
- DRY principles
- Single responsibility

### Error Handling
- Try-catch blocks in async operations
- Meaningful error messages
- Graceful degradation
- User-friendly error states

### State Management
- React Context for global state
- Local state for component-specific
- Avoid prop drilling
- Memoization for expensive computations

### API Design
- RESTful conventions
- Consistent response formats
- Proper HTTP status codes
- Pagination for lists

### Database Patterns
- RLS for security
- Indexes for performance
- Transactions for data integrity
- Soft deletes where appropriate

## Maintenance & Updates

### Dependency Updates
- Regular security patches
- Major version upgrades with testing
- Lock files for reproducibility

### Database Maintenance
- Monitor database size
- Archive old data as needed
- Vacuum and analyze (handled by Supabase)
- Review and optimize queries

### API Key Rotation
- Rotate YouTube API key periodically
- Update VAPID keys if compromised
- Rotate Supabase keys on schedule

## Future Enhancements

Potential improvements beyond MVP:
- Video upload support (not just YouTube links)
- Direct messaging between users
- Advanced search filters
- Content recommendation engine
- Mobile native apps (React Native)
- Admin dashboard with analytics
- Multi-language support
- Accessibility improvements
- Performance optimizations

