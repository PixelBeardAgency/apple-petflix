# 🔧 Configuration Changes Required

## 🔴 CRITICAL: Supabase Configuration

### 1. Password Reset Redirect URL

**Issue:** Password reset emails pointing to `localhost:3000` instead of your Vercel domain.

**Fix in Supabase Dashboard:**

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add your Vercel domain:
   ```
   https://applepetflix.vercel.app/reset-password
   https://applepetflix.vercel.app/*
   ```
4. Also add preview URLs for testing:
   ```
   https://*.vercel.app/reset-password
   https://*.vercel.app/*
   ```

**Alternative: Site URL Configuration**
1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://applepetflix.vercel.app`
3. This becomes the default for auth emails

---

## 🔵 Vercel Environment Variables

### Check Your Current Variables

Make sure these are set in Vercel dashboard:

**Frontend Variables:**
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=              # Leave empty for relative paths in production
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

**Backend Variables:**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
YOUTUBE_API_KEY=your_youtube_api_key
NODE_ENV=production
FRONTEND_URL=https://applepetflix.vercel.app
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

---

## 📧 Supabase Email Templates (Optional but Recommended)

### Customize Password Reset Email

1. Go to **Authentication** → **Email Templates**
2. Find **Reset Password** template
3. Update the magic link to use your domain:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

The `{{ .ConfirmationURL }}` will automatically use your configured redirect URLs.

---

## 🗄️ Supabase Database Migrations Needed

### 1. Add Admin Column to Profiles

Run this SQL in Supabase SQL Editor:

```sql
-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Make yourself admin (replace with your user ID)
UPDATE profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID_HERE';

-- Or make yourself admin by email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

**To find your user ID:**
```sql
SELECT id, email, username FROM profiles WHERE email = 'your-email@example.com';
```

### 2. Add Tutorial Completed Column to Profiles

Run this SQL in Supabase SQL Editor:

```sql
-- Add onboarding tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tutorial_skipped BOOLEAN DEFAULT false;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_tutorial ON profiles(tutorial_completed) WHERE tutorial_completed = false;
```

### 3. Fix Playlist Video Count

Run this SQL in Supabase SQL Editor:

```sql
-- Add video_count column to playlists if not exists
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS video_count INTEGER DEFAULT 0;

-- Update existing playlists with correct counts
UPDATE playlists p
SET video_count = (
  SELECT COUNT(*) 
  FROM playlist_videos pv 
  WHERE pv.playlist_id = p.id
);

-- Create trigger to auto-update video_count
CREATE OR REPLACE FUNCTION update_playlist_video_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE playlists 
    SET video_count = video_count + 1 
    WHERE id = NEW.playlist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE playlists 
    SET video_count = GREATEST(video_count - 1, 0) 
    WHERE id = OLD.playlist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS playlist_video_count_trigger ON playlist_videos;

-- Create trigger
CREATE TRIGGER playlist_video_count_trigger
AFTER INSERT OR DELETE ON playlist_videos
FOR EACH ROW
EXECUTE FUNCTION update_playlist_video_count();
```

### 4. Fix Video Reports Relationship (Moderation Error)

Run this SQL in Supabase SQL Editor:

```sql
-- Verify video_reports table structure
-- If it doesn't exist, create it:

CREATE TABLE IF NOT EXISTS video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_reports_video ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_reporter ON video_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);

-- Enable RLS
ALTER TABLE video_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can report videos
CREATE POLICY "Users can create reports" ON video_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can see their own reports
CREATE POLICY "Users can view own reports" ON video_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can see all reports
CREATE POLICY "Admins can view all reports" ON video_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON video_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
```

---

## 🔔 Add Push Notification Preferences to Profiles

Push notification preferences need to be stored in the profiles table.

Run in Supabase SQL Editor:

```sql
-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_follows BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_videos BOOLEAN DEFAULT true;
```

These columns control which types of push notifications users receive:
- `notification_follows`: Notifications when someone follows them
- `notification_comments`: Notifications when someone comments on their videos
- `notification_videos`: Notifications when people they follow share new videos

---

## 🔐 Supabase Storage Configuration (for Profile Pictures)

### Create Storage Bucket for Avatars

Run in Supabase SQL Editor or Storage UI:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### Set Storage Policies

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## ✅ Configuration Checklist

### Supabase Dashboard
- [ ] Add Vercel domain to Redirect URLs
- [ ] Set Site URL to production domain
- [ ] Update email templates (optional)
- [ ] Run SQL migration for `is_admin` column
- [ ] Run SQL migration for `tutorial_completed` column
- [ ] Run SQL migration for `video_count` column and trigger
- [ ] Run SQL migration for `video_reports` table
- [ ] Create `avatars` storage bucket
- [ ] Set storage policies for avatars
- [ ] Make your account admin (UPDATE profiles)

### Vercel Dashboard
- [ ] Verify all environment variables are set
- [ ] Ensure `VITE_API_URL` is empty or relative in production
- [ ] Verify `FRONTEND_URL` points to Vercel domain
- [ ] Redeploy after Supabase changes

### Test After Changes
- [ ] Password reset email links to Vercel domain
- [ ] Can access moderation page as admin
- [ ] Can't access moderation page as regular user
- [ ] Playlist video counts are correct
- [ ] Tutorial shows for new users on each account

---

## 🚨 How to Find Your User ID to Make Yourself Admin

### Option 1: Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Find your user
3. Copy the UUID

### Option 2: SQL Query
```sql
SELECT id, email, username 
FROM profiles 
WHERE email = 'your-email@example.com';
```

### Option 3: Browser Console (when logged in)
```javascript
// Run on your app
const { data: { user } } = await supabase.auth.getUser();
console.log('My User ID:', user.id);
```

Then run:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'PASTE_YOUR_ID_HERE';
```

---

## 📝 After Running All Migrations

You should have:
- ✅ `profiles.is_admin` column
- ✅ `profiles.tutorial_completed` column
- ✅ `profiles.tutorial_skipped` column
- ✅ `playlists.video_count` column with auto-update trigger
- ✅ `video_reports` table with RLS policies
- ✅ `avatars` storage bucket with policies
- ✅ At least one admin user (you!)

---

## 🔄 Order of Operations

**Do this in order:**

1. ✅ Supabase: Add redirect URLs
2. ✅ Supabase: Run all SQL migrations (copy/paste each section)
3. ✅ Supabase: Make yourself admin
4. ✅ Supabase: Create avatars bucket and policies
5. ✅ Vercel: Verify environment variables
6. ✅ Vercel: Trigger redeploy (or wait for next git push)
7. ✅ Test: Try password reset
8. ✅ Test: Access moderation page as admin
9. ✅ Test: Create new account, check tutorial
10. ✅ Test: Check playlist counts

---

## 💡 Tips

- **Backup first:** Supabase SQL Editor has a "History" tab if you need to revert
- **Test locally first:** Run migrations on local Supabase if you have one
- **One migration at a time:** Run each SQL block separately, check for errors
- **Vercel preview:** Test on preview deployments before production
- **Email testing:** Use a real email or check Supabase logs for magic links

---

## 🆘 If Something Goes Wrong

### Password reset still points to localhost:
- Double-check redirect URLs in Supabase (include wildcard: `https://*.vercel.app/*`)
- Check Site URL is set correctly
- Clear browser cache and try again
- Check Supabase logs for the actual URL being sent

### Can't access moderation page:
- Verify `is_admin = true` in profiles table for your user
- Check backend middleware is checking `is_admin`
- Check console for errors

### Playlist counts still wrong:
- Manually run the UPDATE query again
- Check trigger was created successfully
- Add a video to a playlist and see if count updates

---

**Need help with any of these?** Let me know which step you're on!

