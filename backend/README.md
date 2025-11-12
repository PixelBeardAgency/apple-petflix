# Petflix Backend

Express + TypeScript API server for Petflix.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and fill in your values:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
YOUTUBE_API_KEY=your_youtube_api_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the SQL to create tables, indexes, RLS policies, and triggers

### 4. Generate VAPID Keys (for Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to your `.env` file.

### 5. Run Development Server

```bash
npm run dev
```

The server will start on http://localhost:3001

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
backend/
├── src/
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic (YouTube, Push, Logger)
│   ├── middleware/     # Express middleware (auth, error handling, rate limiting)
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Express app setup
├── supabase/
│   └── migrations/     # Database migration files
└── logs/               # Log files (created automatically)
```

## API Endpoints

### Health Check

- `GET /health` - Server health check

### YouTube (Coming in Phase 3)

- `GET /api/youtube/search` - Search YouTube videos
- `GET /api/youtube/video/:videoId` - Get video details
- `GET /api/youtube/trending` - Get trending pet videos

### Videos (Coming in Phase 3)

- `POST /api/videos` - Share a video
- `GET /api/videos/:videoId` - Get video details
- `PUT /api/videos/:videoId` - Update video
- `DELETE /api/videos/:videoId` - Delete video

### More endpoints will be added in subsequent phases...

## Authentication

The backend uses Supabase Auth for user authentication. All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- Global: 100 requests per 15 minutes per IP
- YouTube search: 20 requests per minute per user
- Video sharing: 10 videos per hour per user
- Comments: 30 comments per hour per user

## Logging

Logs are written to:
- Console (all levels in development, info+ in production)
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Log files rotate automatically at 5MB with a maximum of 5 files.

## YouTube API Quota

The free tier provides 10,000 units per day:
- Search: 100 units
- Video details: 1 unit
- Trending: 100 units

The backend implements aggressive caching to minimize API calls.

## Testing

```bash
npm test
```

Tests use Jest and Supertest for API testing.

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Start the server:
   ```bash
   npm start
   ```

Recommended platforms:
- Railway
- Render
- DigitalOcean App Platform
- Heroku

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Your Supabase project URL | Yes |
| SUPABASE_ANON_KEY | Supabase anonymous key | Yes |
| SUPABASE_SERVICE_KEY | Supabase service role key | Yes |
| YOUTUBE_API_KEY | YouTube Data API v3 key | Yes |
| PORT | Server port (default: 3001) | No |
| NODE_ENV | Environment (development/production) | No |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| VAPID_PUBLIC_KEY | Web Push public key | Yes |
| VAPID_PRIVATE_KEY | Web Push private key | Yes |
| VAPID_SUBJECT | Contact email for push service | Yes |

