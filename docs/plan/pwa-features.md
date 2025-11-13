# PWA Features Documentation

## Overview

Petflix is configured as a Progressive Web App (PWA), providing an app-like experience with offline capabilities, installation support, and enhanced performance.

## Features Implemented

### 1. PWA Manifest (`manifest.json`)

**Location**: `frontend/public/manifest.json`

**Configuration**:
- **Name**: "Petflix - Pet Video Sharing"
- **Short Name**: "Petflix"
- **Theme Color**: #f97316 (orange)
- **Background Color**: #ffffff
- **Display Mode**: standalone (hides browser UI)
- **Orientation**: portrait-primary
- **Start URL**: /
- **Icons**: 8 sizes (72px to 512px)
- **Shortcuts**: Quick access to Search, Feed, and Share pages
- **Categories**: entertainment, social, lifestyle

### 2. Service Worker with Workbox

**Configuration**: `frontend/vite.config.ts`

#### Cache Strategies:

1. **API Calls** (NetworkFirst)
   - Cache name: `api-cache`
   - Max entries: 50
   - Max age: 5 minutes
   - Timeout: 10 seconds
   - Fallback to cache if network fails

2. **Supabase API** (NetworkFirst)
   - Cache name: `supabase-cache`
   - Max entries: 30
   - Max age: 1 day
   - Timeout: 10 seconds

3. **YouTube Thumbnails** (CacheFirst)
   - Cache name: `youtube-thumbnails`
   - Max entries: 100
   - Max age: 30 days
   - Aggressive caching for performance

4. **Google APIs** (CacheFirst)
   - Cache name: `google-apis-cache`
   - Max entries: 50
   - Max age: 7 days

5. **Images** (CacheFirst)
   - Cache name: `image-cache`
   - Max entries: 100
   - Max age: 30 days
   - Covers profile pictures and external images

#### Service Worker Behaviors:
- **Auto-update**: Service worker updates automatically
- **Skip waiting**: New SW activates immediately
- **Clients claim**: Takes control of all pages immediately
- **Cleanup**: Old caches are automatically removed

### 3. Install Prompt Component

**Component**: `PWAInstallPrompt.tsx`

**Features**:
- Detects if app is already installed
- Shows prompt after 30 seconds on site
- Dismissible with 7-day cooldown
- Lists benefits:
  - Quick access from home screen
  - Works offline with cached content
  - Faster loading times
  - Native app-like experience
- Stores dismissal state in localStorage
- Handles `beforeinstallprompt` event
- Listens for successful installation

**User Flow**:
1. User visits site
2. After 30 seconds, prompt appears (if not dismissed recently)
3. User can install or dismiss
4. If dismissed, won't show again for 7 days
5. If installed, prompt never shows again

### 4. Offline Indicator Component

**Component**: `OfflineIndicator.tsx`

**Features**:
- Monitors online/offline status
- Shows yellow banner when offline
- Shows "Back online!" when connection restored
- Positioned at top center of screen
- Auto-dismisses when online
- Icon: WifiOff from lucide-react

**States**:
- **Online**: Hidden
- **Offline**: "You are offline - Using cached content"
- **Back Online**: "Back online!" (temporary)

### 5. Update Prompt Component

**Component**: `UpdatePrompt.tsx`

**Features**:
- Detects when new app version is available
- Shows update notification
- Allows immediate reload or later
- Uses `virtual:pwa-register/react` hook
- Positioned at bottom left
- Styled with primary color

**User Flow**:
1. New version deploys
2. Service worker detects update
3. Prompt appears
4. User can reload now or dismiss
5. If dismissed, will show again on next page load

### 6. Enhanced Meta Tags

**Location**: `frontend/index.html`

**Added Tags**:
- Primary meta tags (title, description, keywords)
- PWA meta tags (theme-color, mobile-web-app-capable)
- Apple-specific tags (apple-mobile-web-app-capable, status bar style)
- Icon links (multiple sizes, apple-touch-icon)
- Open Graph tags (Facebook sharing)
- Twitter Card tags (Twitter sharing)

### 7. App Shortcuts

**Configured Shortcuts**:
1. **Search Videos**: Direct link to `/search`
2. **My Feed**: Direct link to `/feed`
3. **Share Video**: Direct link to `/share`

Users can long-press the app icon on Android or right-click on desktop to access these shortcuts.

## Offline Capabilities

### What Works Offline:

1. **Previously Viewed Pages**: All visited pages are cached
2. **Images**: YouTube thumbnails and profile pictures (if previously loaded)
3. **API Responses**: Recent API calls (5-minute cache)
4. **Auth State**: User session persists offline
5. **UI Assets**: All JavaScript, CSS, fonts, and icons

### What Doesn't Work Offline:

1. **New Video Search**: Requires YouTube API (network)
2. **Posting Comments**: Requires API write access
3. **Following Users**: Requires real-time database updates
4. **Video Playback**: YouTube embeds require network
5. **New Notifications**: Real-time updates require connection

### Fallback Behavior:

- API calls attempt network first
- If network fails within 10 seconds, cached response is used
- If no cached response exists, error is shown
- Offline indicator informs user of limited functionality

## Installation Process

### Desktop (Chrome/Edge):

1. Visit the site
2. Look for install icon in address bar
3. Click "Install Petflix"
4. App opens in standalone window
5. App icon added to applications menu

### Android (Chrome):

1. Visit the site
2. Tap "Add to Home Screen" from menu
3. Or wait for automatic install banner
4. App icon added to home screen
5. Opens in fullscreen mode

### iOS (Safari):

1. Visit the site
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon added to home screen
5. Opens in standalone mode

## Testing PWA Features

### Chrome DevTools:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest**: View manifest.json configuration
   - **Service Workers**: See registration and status
   - **Cache Storage**: View cached resources
   - **Offline**: Toggle offline mode to test

### Lighthouse Audit:

```bash
# Run Lighthouse PWA audit
npm run build
npx serve -s dist
# Open Chrome DevTools > Lighthouse > PWA category
```

**PWA Checklist**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Provides custom offline page
- ✅ Sets theme color
- ✅ Has maskable icon
- ✅ Viewport is properly configured
- ✅ HTTPS ready (production)

### Manual Testing:

1. **Install Test**:
   - Visit site in Chrome
   - Check for install prompt
   - Install app
   - Verify standalone mode

2. **Offline Test**:
   - Open DevTools
   - Go to Network tab
   - Check "Offline"
   - Navigate app
   - Verify cached content loads

3. **Update Test**:
   - Make code change
   - Build and deploy
   - Reload app
   - Verify update prompt appears

4. **Cache Test**:
   - Browse several pages
   - Check Application > Cache Storage
   - Verify resources are cached

## Performance Optimizations

### Cache Strategy Benefits:

1. **CacheFirst for Static Assets**:
   - Instant loading of images
   - No network delay
   - Reduced bandwidth usage

2. **NetworkFirst for Dynamic Data**:
   - Always fresh when online
   - Fallback when offline
   - 10-second timeout prevents hanging

3. **Aggressive Image Caching**:
   - 30-day cache for thumbnails
   - 100-entry limit
   - Significantly improves perceived performance

### Workbox Configuration:

- **Precaching**: All build assets precached
- **Runtime Caching**: Dynamic content cached on-demand
- **Cache Expiration**: Automatic cleanup of old entries
- **Background Sync**: (Future enhancement)
- **Push Notifications**: (Future enhancement - Phase 8)

## Future Enhancements

### Phase 8 Integration:
- Web Push Notifications
- Background sync for offline actions
- Push notification badge updates

### Additional Features:
- Periodic background sync for feed updates
- Share Target API (share to Petflix from other apps)
- File System Access API (save videos locally)
- Web Share API (share videos from Petflix)

## Troubleshooting

### Issue: Install Prompt Not Showing

**Solutions**:
1. Check if already installed
2. Clear localStorage: `localStorage.removeItem('pwa-prompt-dismissed')`
3. Verify HTTPS (required in production)
4. Check browser support (Chrome, Edge, Samsung Internet)

### Issue: Service Worker Not Updating

**Solutions**:
1. Check "Update on reload" in DevTools > Application
2. Unregister old service worker
3. Clear cache storage
4. Hard refresh (Ctrl+Shift+R)

### Issue: Offline Content Not Loading

**Solutions**:
1. Visit pages while online first (to cache them)
2. Check Network tab for failed requests
3. Verify cache storage contains resources
4. Check service worker status

### Issue: Icons Not Displaying

**Solutions**:
1. Generate icons using instructions in `/public/icons/README.md`
2. Verify icon paths in manifest.json
3. Check icon sizes match manifest
4. Clear browser cache

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Chrome PWA Checklist](https://web.dev/pwa-checklist/)

## Maintenance

### Regular Tasks:

1. **Update Service Worker**: When making significant changes
2. **Monitor Cache Size**: Ensure caches don't grow too large
3. **Test Offline Mode**: After each major update
4. **Update Icons**: When rebranding
5. **Review Cache Strategies**: Adjust based on usage patterns

### Version Updates:

When deploying new versions:
1. Service worker auto-updates
2. Update prompt appears for users
3. Users reload to get latest version
4. Old caches are cleaned up automatically

---

**Status**: ✅ Phase 6 Complete - PWA features fully implemented and documented.

