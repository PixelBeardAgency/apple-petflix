# Vercel Environment Variables - Quick Setup Guide

## 🚨 CRITICAL: Your feed is failing because environment variables are missing!

## Step-by-Step Fix

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### 2. Navigate to Your Project Settings
1. Click on your `applepetflix` project
2. Go to **Settings** tab (top navigation)
3. Click **Environment Variables** (left sidebar)

### 3. Add These Variables

Click **"Add New"** for each of these:

#### Option A: Use Relative URLs (Recommended)
```
Variable Name: VITE_API_URL
Value: (leave empty - just press Add)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Supabase Configuration (REQUIRED)
```
Variable Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: VITE_SUPABASE_ANON_KEY
Value: your-supabase-anon-key-here
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Backend Configuration (REQUIRED)
```
Variable Name: SUPABASE_URL
Value: https://your-project.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: SUPABASE_SERVICE_KEY
Value: your-supabase-service-role-key-here
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: YOUTUBE_API_KEY
Value: your-youtube-api-key-here
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: FRONTEND_URL
Value: https://applepetflix.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Optional: Push Notifications
```
Variable Name: VITE_VAPID_PUBLIC_KEY
Value: your-vapid-public-key
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: VAPID_PUBLIC_KEY
Value: your-vapid-public-key
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: VAPID_PRIVATE_KEY
Value: your-vapid-private-key
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable Name: VAPID_SUBJECT
Value: mailto:your@email.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### 4. Redeploy

After adding all variables:

**Option A: From Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Confirm

**Option B: Push a New Commit** (already done ✅)
The latest push will trigger a new deployment automatically.

### 5. Wait for Deployment

- Watch the deployment in the Vercel dashboard
- Should complete in 2-3 minutes
- You'll get an email when done

### 6. Test Your Feed

1. Visit https://applepetflix.vercel.app
2. Log in
3. Click "Your Feed"
4. Should work! 🎉

## What Changed?

I've updated the code to:
- ✅ Use relative URLs in production (no need for full domain)
- ✅ Centralize API URL configuration in `frontend/src/config/api.ts`
- ✅ Fix CORS to allow Vercel domains
- ✅ Update all service files to use the new config

## Need Help?

If you're missing any of these keys:
- **Supabase**: Get from https://app.supabase.com → Your Project → Settings → API
- **YouTube**: Get from https://console.cloud.google.com → APIs & Services → Credentials
- **VAPID**: Generate with `npm run generate-vapid-keys` in the backend folder

---

**Next Steps After Setting Variables:**
Wait for the redeploy to complete (Vercel will automatically trigger one from your latest push), then test your feed!

