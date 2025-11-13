# Petflix Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Docker**: v24.x or higher (for containerized deployment)
- **PostgreSQL**: v14.x or higher (handled by Supabase)

### Required Services
- **Supabase Account**: For database and authentication
- **YouTube API Key**: For video search functionality
- **VAPID Keys**: For web push notifications

---

## Environment Variables

### Backend (.env)

Create `/backend/.env`:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Web Push Notifications (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

### Frontend (.env)

Create `/frontend/.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_URL=https://api.your-domain.com

# YouTube API
VITE_YOUTUBE_API_KEY=your-youtube-api-key

# Web Push Notifications
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### Generating VAPID Keys

```bash
cd backend
npx web-push generate-vapid-keys
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and keys

### 2. Run Migrations

Navigate to Supabase Dashboard → SQL Editor and run migrations in order:

```sql
-- Run each migration file in order:
-- 1. backend/supabase/migrations/001_initial_schema.sql
-- 2. backend/supabase/migrations/002_update_notifications.sql
-- 3. backend/supabase/migrations/003_notification_preferences.sql
-- 4. backend/supabase/migrations/004_performance_indexes.sql
```

### 3. Enable Row Level Security (RLS)

RLS policies are included in the migration files. Verify they're enabled:

```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## Local Development

### Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your values
npm run dev
```

Backend will start on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your values
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## Docker Deployment

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/petflix.git
cd petflix
```

2. **Create .env file in root**
```bash
cp docker-compose.yml.example docker-compose.yml
# Edit docker-compose.yml with your environment variables
```

3. **Build and start containers**
```bash
docker-compose up -d
```

4. **Check status**
```bash
docker-compose ps
docker-compose logs -f
```

### Individual Container Commands

**Build images:**
```bash
docker-compose build
```

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Restart a service:**
```bash
docker-compose restart backend
```

---

## Cloud Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel
```

3. **Set environment variables** in Vercel Dashboard

4. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Backend on Railway

1. **Create new Railway project**
```bash
cd backend
railway init
railway up
```

2. **Set environment variables** in Railway Dashboard

3. **Deploy:**
```bash
railway up
```

### Option 2: DigitalOcean App Platform

1. **Connect your repository** to DigitalOcean

2. **Configure frontend app:**
   - Type: Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

3. **Configure backend app:**
   - Type: Web Service
   - Build Command: `cd backend && npm install && npm run build`
   - Run Command: `cd backend && npm start`

4. **Set environment variables** for both apps

### Option 3: AWS (EC2 + S3 + CloudFront)

#### Backend on EC2

1. **Launch EC2 instance** (Ubuntu 22.04 LTS)

2. **SSH and setup:**
```bash
ssh ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/petflix.git
cd petflix/backend

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name petflix-backend
pm2 save
pm2 startup
```

3. **Setup nginx as reverse proxy:**
```bash
sudo apt install nginx

# Configure nginx (see nginx.conf example below)
sudo nano /etc/nginx/sites-available/petflix-api

sudo ln -s /etc/nginx/sites-available/petflix-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Frontend on S3 + CloudFront

1. **Build frontend:**
```bash
cd frontend
npm install
npm run build
```

2. **Create S3 bucket** and upload `dist/` contents

3. **Enable static website hosting** on S3

4. **Create CloudFront distribution** pointing to S3 bucket

5. **Configure custom domain** with Route 53

### Option 4: Google Cloud Platform

#### Backend on Cloud Run

```bash
cd backend

# Build container
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/petflix-backend

# Deploy
gcloud run deploy petflix-backend \
  --image gcr.io/YOUR-PROJECT-ID/petflix-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Frontend on Firebase Hosting

```bash
cd frontend

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

---

## Monitoring & Maintenance

### Health Checks

**Backend:**
```bash
curl http://your-api-domain/health
```

**Frontend:**
```bash
curl http://your-domain/health
```

### Logs

**Docker:**
```bash
docker-compose logs -f
docker-compose logs --tail=100 backend
```

**PM2:**
```bash
pm2 logs petflix-backend
pm2 logs petflix-backend --lines 100
```

### Performance Monitoring

**Check metrics endpoint:**
```bash
curl http://your-api-domain/metrics
```

**Monitor system resources:**
```bash
# CPU and memory
docker stats

# Disk usage
df -h

# Process status
pm2 status
```

### Database Backups

Supabase automatically backs up your database daily. To manual backup:

1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Click "Download Backup"

### Security Updates

**Update dependencies:**
```bash
# Backend
cd backend
npm audit fix
npm update

# Frontend
cd frontend
npm audit fix
npm update
```

**Rebuild containers:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Troubleshooting

### Common Issues

#### Backend won't start

**Check logs:**
```bash
docker-compose logs backend
# or
pm2 logs petflix-backend
```

**Common causes:**
- Missing environment variables
- Database connection issues
- Port already in use

**Solutions:**
```bash
# Check environment variables
env | grep SUPABASE
env | grep YOUTUBE

# Test database connection
curl https://your-project.supabase.co/rest/v1/

# Check port availability
lsof -i :3001
```

#### Frontend shows blank page

**Check browser console** for errors

**Common causes:**
- API URL misconfigured
- CORS issues
- Missing environment variables

**Solutions:**
```bash
# Verify environment variables
cat frontend/.env

# Check API connectivity
curl http://your-api-url/health

# Rebuild frontend
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

#### Database connection errors

**Check Supabase status:**
- Visit Supabase Dashboard
- Check project status

**Verify credentials:**
```bash
# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/
```

#### Rate limiting issues

**Check rate limit headers:**
```bash
curl -I http://your-api-url/api/videos
```

**Adjust rate limits** in `backend/src/middleware/rateLimit.ts`

#### CORS errors

**Update CORS configuration** in `backend/src/server.ts`:
```typescript
const allowedOrigins = [
  'https://your-production-domain.com',
  'http://localhost:5173',
];
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] All environment variables set securely
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured for production domains only
- [ ] Rate limiting configured appropriately
- [ ] Security headers enabled
- [ ] Database RLS policies verified
- [ ] API keys rotated from development

### Performance
- [ ] Frontend built with production optimization
- [ ] CDN configured for static assets
- [ ] Database indexes created
- [ ] Caching enabled
- [ ] Gzip compression enabled

### Monitoring
- [ ] Health checks configured
- [ ] Logging configured
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Uptime monitoring setup (e.g., UptimeRobot)
- [ ] Performance monitoring enabled

### Backup & Recovery
- [ ] Database backup schedule configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Environment variables backed up securely

### Testing
- [ ] All tests passing
- [ ] E2E tests run against staging
- [ ] Load testing completed
- [ ] Security audit performed

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/petflix/issues
- Email: support@example.com
- Documentation: https://github.com/yourusername/petflix/docs

---

**Last Updated:** Phase 12 - Testing & Deployment

