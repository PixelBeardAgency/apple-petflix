# Vercel Environment Variables Setup

## Critical Issue
Your Vercel deployment is missing environment variables! This is why the feed returns 404.

## Required Environment Variables

### In Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development** environments:

### Backend API Configuration
```
VITE_API_URL=https://applepetflix.vercel.app
```
OR (better - use relative URLs):
```
VITE_API_URL=
```
(Empty string will make the frontend use relative URLs like `/api/feed` instead of `http://localhost:3001/api/feed`)

### Supabase Configuration
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Push Notifications (if using)
```
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Backend Environment Variables
Also ensure your backend serverless function has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
YOUTUBE_API_KEY=your_youtube_api_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your@email.com
FRONTEND_URL=https://applepetflix.vercel.app
NODE_ENV=production
```

## How to Add in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Select which environments (Production, Preview, Development)
6. Click **Save**
7. Redeploy your project

## Quick Fix

The easiest solution is to set:
```
VITE_API_URL=
```
(empty string)

This will make all API calls use relative URLs, which works perfectly since your frontend and backend are on the same domain (`applepetflix.vercel.app`).

## After Setting Variables

You MUST trigger a new deployment for the variables to take effect:
- Either push a new commit
- Or go to Vercel Dashboard → Deployments → Click "..." on latest → Redeploy

