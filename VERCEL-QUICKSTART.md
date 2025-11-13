# 🚀 Vercel Deployment Quick Start

## 3-Minute Deploy to Vercel

### Option 1: GitHub Integration (Easiest) ⭐

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your Petflix repo
   - Click "Import"

3. **Add Environment Variables**
   
   Copy these to Vercel Dashboard → Settings → Environment Variables:
   
   ```env
   # Backend (add these to "Environment Variables")
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   YOUTUBE_API_KEY=your-youtube-key
   FRONTEND_URL=https://your-app.vercel.app
   VAPID_PUBLIC_KEY=your-vapid-public
   VAPID_PRIVATE_KEY=your-vapid-private
   VAPID_SUBJECT=mailto:your-email@example.com
   NODE_ENV=production
   PORT=3001
   
   # Frontend (add these to "Environment Variables")
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://your-app.vercel.app/api
   VITE_YOUTUBE_API_KEY=your-youtube-key
   VITE_VAPID_PUBLIC_KEY=your-vapid-public
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

---

### Option 2: CLI Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Add environment variables in dashboard
# Then deploy to production
vercel --prod
```

---

## What Happens Automatically

✅ Frontend builds and deploys
✅ Backend converts to serverless functions
✅ SSL certificate provisioned
✅ CDN enabled globally
✅ Automatic HTTPS
✅ Preview deployments for branches
✅ Auto-deploy on git push

---

## Your URLs After Deployment

- **App:** https://your-app.vercel.app
- **API:** https://your-app.vercel.app/api
- **Health:** https://your-app.vercel.app/health

---

## GitHub Secrets (for CI/CD)

Add these to GitHub → Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN=your-vercel-token (from vercel.com/account/tokens)
VERCEL_ORG_ID=your-org-id (from .vercel/project.json after first deploy)
VERCEL_PROJECT_ID=your-project-id (from .vercel/project.json)
```

---

## Post-Deployment Checklist

- [ ] Visit your deployed URL
- [ ] Test user registration
- [ ] Test video sharing
- [ ] Test push notifications
- [ ] Check service worker is active
- [ ] Verify API endpoints working

---

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Check Node.js version (should be 20.x)

**API not working?**
- Check `VITE_API_URL` points to your Vercel URL
- Check CORS settings in backend

**Service worker not working?**
- Must be on HTTPS (Vercel provides this)
- Clear cache and reload

---

## Full Documentation

See [VERCEL-DEPLOYMENT.md](./docs/VERCEL-DEPLOYMENT.md) for complete guide.

---

**That's it! Your app is live! 🚀**

