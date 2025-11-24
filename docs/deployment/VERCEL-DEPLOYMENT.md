# Vercel Deployment Guide for Petflix

## 🚀 Quick Start

Petflix is now configured for seamless Vercel deployment! Both frontend and backend can be deployed to Vercel.

---

## Option 1: Monorepo Deployment (Recommended)

Deploy both frontend and backend from a single repository.

### Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Code pushed to GitHub
3. **Environment Variables** - Have your keys ready

### Step-by-Step Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy from Root Directory

```bash
cd /path/to/petflix
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** petflix
- **Directory?** ./
- **Override settings?** No

#### 4. Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Backend Variables:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
YOUTUBE_API_KEY=your-youtube-key
FRONTEND_URL=https://your-app.vercel.app
VAPID_PUBLIC_KEY=your-vapid-public
VAPID_PRIVATE_KEY=your-vapid-private
VAPID_SUBJECT=mailto:your-email@example.com
NODE_ENV=production
PORT=3001
```

**Frontend Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-app.vercel.app/api
VITE_YOUTUBE_API_KEY=your-youtube-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public
```

#### 5. Redeploy with Environment Variables

```bash
vercel --prod
```

---

## Option 2: Separate Deployments

Deploy frontend and backend as separate Vercel projects.

### Deploy Frontend

```bash
cd frontend
vercel

# Follow prompts
# Project name: petflix-frontend
# Directory: ./
```

**Set Frontend Environment Variables in Vercel Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (will be your backend URL)
- `VITE_YOUTUBE_API_KEY`
- `VITE_VAPID_PUBLIC_KEY`

**Deploy to production:**
```bash
vercel --prod
```

### Deploy Backend

```bash
cd backend
vercel

# Follow prompts
# Project name: petflix-backend
# Directory: ./
```

**Set Backend Environment Variables in Vercel Dashboard:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `YOUTUBE_API_KEY`
- `FRONTEND_URL` (your frontend Vercel URL)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `NODE_ENV=production`

**Deploy to production:**
```bash
vercel --prod
```

**Update Frontend `VITE_API_URL`:**
- Go to frontend project settings
- Update `VITE_API_URL` to your backend Vercel URL
- Redeploy frontend

---

## Option 3: GitHub Integration (Easiest)

### 1. Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your Petflix repository
4. Click "Import"

### 2. Configure Root Project

**Root Directory:** `./`
**Framework Preset:** Other
**Build Command:** `cd frontend && npm install && npm run build`
**Output Directory:** `frontend/dist`
**Install Command:** `npm install --prefix frontend && npm install --prefix backend`

### 3. Add Environment Variables

Add all environment variables (see Option 1) in:
- Project Settings → Environment Variables
- Set for: Production, Preview, Development

### 4. Deploy

Click "Deploy" - Vercel will automatically build and deploy!

### 5. Automatic Deployments

Every push to `main` branch will automatically deploy! 🎉

---

## Configuration Files Explained

### Root `vercel.json`
- Routes API requests to backend
- Routes all other requests to frontend
- Sets up caching headers
- Configures CORS

### Frontend `frontend/vercel.json`
- SPA routing (all routes → index.html)
- Optimized caching for assets
- Security headers
- Service worker configuration

### Backend `backend/vercel.json`
- Serverless function configuration
- 30-second timeout for API routes
- Environment variables

### Backend `backend/api/index.ts`
- Entry point for Vercel serverless
- Exports Express app

---

## Vercel Project Settings

### General Settings

**Framework Preset:** Other (or Vite for frontend-only)
**Node.js Version:** 20.x
**Build Command:** `npm run build` (or auto-detected)
**Output Directory:** `dist` (or auto-detected)
**Install Command:** `npm install` (or auto-detected)

### Build & Development Settings

**Root Directory:** `./` for monorepo, or `frontend`/`backend` for separate

### Environment Variables

Add all required variables for both frontend and backend.

**Pro Tip:** Use Vercel's environment variable groups for different environments (Production, Preview, Development)

### Domains

**Production Domain:** your-app.vercel.app (or custom domain)
**API Endpoint:** your-app.vercel.app/api
**Frontend:** your-app.vercel.app

### Git Integration

**Production Branch:** main
**Automatic Deployments:** Enabled
**Preview Deployments:** Enabled (all branches)

---

## Custom Domain Setup

### 1. Add Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `petflix.com`
4. Add both:
   - `petflix.com`
   - `www.petflix.com`

### 2. Configure DNS

**Option A: Vercel Nameservers (Recommended)**
- Update nameservers at your domain registrar
- Point to Vercel nameservers (provided in dashboard)

**Option B: Custom DNS**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL Certificate

Vercel automatically provisions SSL certificates! 🔒

No configuration needed - HTTPS works immediately.

---

## Performance Optimization on Vercel

### 1. Edge Functions (Optional)

For ultra-low latency, convert critical API routes to Edge Functions:

```typescript
// backend/api/health.ts
export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new Response(
    JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

### 2. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// frontend/src/main.tsx
import { inject } from '@vercel/analytics';

inject();
```

### 3. Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// frontend/src/main.tsx
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();
```

---

## Monitoring & Logs

### View Logs

**Via CLI:**
```bash
vercel logs https://your-app.vercel.app
```

**Via Dashboard:**
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. View "Function Logs"

### Real-time Logs

```bash
vercel logs --follow
```

### Analytics

Built-in analytics available in Vercel Dashboard:
- Page views
- Top pages
- Devices
- Locations
- Performance metrics

---

## Troubleshooting

### Issue: Environment Variables Not Working

**Solution:**
1. Check they're set in correct environment (Production/Preview/Development)
2. Redeploy after adding variables
3. Check for typos in variable names

### Issue: API Routes Return 404

**Solution:**
1. Check `vercel.json` routes configuration
2. Ensure backend is building correctly
3. Check function logs for errors

### Issue: Build Fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check Node.js version matches (20.x)

### Issue: CORS Errors

**Solution:**
1. Update `FRONTEND_URL` environment variable
2. Check `vercel.json` headers configuration
3. Ensure `VITE_API_URL` points to correct backend

### Issue: Service Worker Not Working

**Solution:**
1. Check service worker headers in `vercel.json`
2. Ensure HTTPS is enabled (required for SW)
3. Clear browser cache and re-register SW

---

## Deployment Checklist

Before deploying to production:

### Pre-Deployment
- [ ] All environment variables documented
- [ ] Database migrations run on Supabase
- [ ] API keys generated and secured
- [ ] VAPID keys generated
- [ ] Frontend `.env` configured
- [ ] Backend `.env` configured

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Test deployment successful

### Post-Deployment
- [ ] Health check passing: `/health`
- [ ] API responding: `/api/videos`
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Service worker registered
- [ ] Push notifications working
- [ ] Monitor logs for errors

---

## Continuous Deployment

### Automatic Deployments

**Production:**
- Deploys automatically on push to `main`
- URL: https://your-app.vercel.app

**Preview:**
- Deploys automatically on push to any branch
- Unique URL per branch
- Perfect for testing features

### Manual Deployments

**Deploy specific branch:**
```bash
git checkout feature-branch
vercel
```

**Deploy to production:**
```bash
vercel --prod
```

**Rollback to previous deployment:**
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Cost Optimization

### Vercel Free Tier Limits

- **Bandwidth:** 100 GB/month
- **Serverless Function Executions:** 100 GB-Hrs
- **Serverless Function Duration:** 10 seconds max
- **Build Minutes:** 6000 minutes/month

**Petflix fits comfortably in free tier for small-medium traffic!**

### Tips to Stay in Free Tier

1. **Enable caching** (already configured)
2. **Optimize images** (already configured)
3. **Use CDN** for static assets
4. **Monitor usage** in dashboard
5. **Set up alerts** for limits

### When to Upgrade to Pro ($20/month)

- > 100 GB bandwidth/month
- Need longer function timeouts
- Want password-protected deployments
- Need team collaboration

---

## Production URLs

After deployment, you'll have:

**Frontend:** `https://your-app.vercel.app`
**Backend API:** `https://your-app.vercel.app/api`
**Health Check:** `https://your-app.vercel.app/health`

---

## Advanced: Multiple Environments

### Setup Preview Environment

Vercel automatically creates preview deployments for branches.

### Setup Staging Environment

1. Create `staging` branch
2. Set branch as production branch for separate project
3. Configure separate environment variables
4. Deploy with different Supabase project

---

## Support

**Vercel Documentation:** https://vercel.com/docs
**Vercel Support:** https://vercel.com/support
**Community Discord:** https://vercel.com/discord

---

## Quick Commands Reference

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# List deployments
vercel ls

# Get deployment URL
vercel inspect

# Remove deployment
vercel remove [deployment-url]

# Link local project
vercel link

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Check project info
vercel project ls
```

---

## Success! 🎉

Your Petflix app is now deployed on Vercel!

**Next Steps:**
1. Share your URL with users
2. Monitor analytics
3. Set up custom domain
4. Enable Vercel Analytics

**Your app is live at: https://your-app.vercel.app** 🚀

---

Last Updated: Vercel Deployment Configuration Added

