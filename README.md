# Petflix

A Progressive Web Application for discovering, sharing, and engaging with pet videos from YouTube.

## Features

- 🔍 Search and discover pet videos from YouTube
- 📹 Share your favorite pet videos with the community
- 👥 Follow other pet lovers
- 💬 Comment and engage with content
- 📱 Progressive Web App (install on mobile & desktop)
- 🔔 Web push notifications
- 📺 TV casting support (Chromecast & AirPlay)
- 🎯 Create and manage playlists
- 🏷️ Custom tags for video organization
- 🌐 Full offline support for metadata
- 🎨 Modern, playful UI with pet-themed illustrations

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + Shadcn UI
- Supabase Client
- Vite PWA Plugin

**Backend:**
- Express + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- YouTube Data API v3
- Web Push Notifications

## Project Structure

```
petflix/
├── backend/          # Express API server
├── frontend/         # React PWA
└── docs/            # Documentation
    └── plan/        # Implementation plan & guides
```

## Prerequisites

- Node.js 20+ and npm
- Supabase account
- YouTube Data API v3 key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd petflix
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the database migration:
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy contents of `backend/supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

### 3. Get YouTube API Key

Follow the guide in [`docs/plan/youtube-api-setup.md`](docs/plan/youtube-api-setup.md)

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your values:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
# - YOUTUBE_API_KEY
# - FRONTEND_URL (http://localhost:5173)

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys
# Add the keys to .env

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your values:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL (http://localhost:3001)
# - VITE_VAPID_PUBLIC_KEY

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Development

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Linting & Formatting

**Backend:**
```bash
cd backend
npm run lint
npm run format
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Documentation

- **[Implementation Plan](docs/plan/pe.plan.md)** - Complete MVP implementation plan
- **[Architecture](docs/plan/architecture.md)** - System architecture and design decisions
- **[YouTube API Setup](docs/plan/youtube-api-setup.md)** - Guide to obtaining YouTube API key
- **[PRD](docs/petflix-prd-2025-11-10.md)** - Product Requirements Document

## Environment Variables

### Backend (.env)

```
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

### Frontend (.env)

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Deployment

### Backend Deployment (Railway/Render/DigitalOcean)

1. Create a new service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables
5. Deploy

### Database (Supabase)

- Hosted PostgreSQL (no deployment needed)
- Run migrations via Supabase Dashboard
- Configure RLS policies

## Features Implementation Status

- ✅ Phase 1: Foundation & Core Setup
- ✅ Phase 2: User Authentication
- ✅ Phase 3: Video Search & Sharing
- ✅ Phase 4: Social Features
- ✅ Phase 5: Content Curation
- ✅ Phase 6: PWA Features
- ✅ Phase 7: TV Casting
- ✅ Phase 8: Push Notifications
- ⏳ Phase 9: User Onboarding
- ⏳ Phase 10: UI/UX Polish
- ⏳ Phase 11: Security & Performance
- ⏳ Phase 12: Testing & Deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Check the documentation in `docs/plan/`
- Review the PRD in `docs/petflix-prd-2025-11-10.md`
- Open an issue on GitHub

## Acknowledgments

- YouTube Data API v3
- Supabase for backend infrastructure
- Shadcn UI for beautiful components
- The React and TypeScript communities

