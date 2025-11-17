# 🧪 Petflix - End-to-End Testing Guide

This document provides a comprehensive testing checklist for all **implemented** Petflix features. Use this to systematically test the application and identify any issues.

> **Note:** This guide only includes features that are currently implemented in the codebase. Features marked as "Not Implemented" are documented at the end for future reference.

---

## 📋 Pre-Testing Setup

### Environment Check
- [ ] Backend server is running (local: `http://localhost:3001`)
- [ ] Frontend server is running (local: `http://localhost:5173`)
- [ ] Supabase connection is working
- [ ] YouTube API key is configured
- [ ] All environment variables are set

### Test Accounts
- **Account 1**: Primary test user (for creating content)
- **Account 2**: Secondary test user (for social features)

---

## 🔐 1. Authentication & Authorization

### Registration
- [ ] Navigate to sign-up page
- [ ] Enter valid email, username, password
- [ ] Submit registration form
- [ ] Verify account is created
- [ ] Verify redirect to feed/onboarding

### Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] Verify successful login
- [ ] Check user is redirected to feed
- [ ] Verify auth token is stored

### Logout
- [ ] Click logout button in header
- [ ] Verify redirect to login/home
- [ ] Verify session is cleared
- [ ] Try accessing protected routes (should redirect to login)

### Password Reset Flow
- [ ] Navigate to login page
- [ ] Click "Forgot password?" link
- [ ] Enter email address
- [ ] Submit form
- [ ] Verify success message: "Check Your Email"
- [ ] Check email inbox for reset link (or check Supabase email logs)
- [ ] Click reset link in email
- [ ] Redirected to `/reset-password` page
- [ ] Enter new password (min 6 characters)
- [ ] Confirm new password
- [ ] Submit form
- [ ] Verify success message: "Password Reset Successful!"
- [ ] Auto-redirect to login page
- [ ] Login with new password
- [ ] Verify login successful

### Password Reset Edge Cases
- [ ] Try reset with invalid email → Should send email anyway (security best practice)
- [ ] Try accessing reset page without token → Shows error message
- [ ] Try password < 6 characters → Validation error
- [ ] Try mismatched passwords → Validation error
- [ ] Click "try again" on success page → Returns to email input form

### Invalid Login
- [ ] Enter wrong password
- [ ] Verify error message displays
- [ ] Try multiple failed attempts (should rate limit after 5 attempts)

---

## 🏠 2. Landing Page

### Initial Load
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] "Get Started" button is visible
- [ ] "Sign In" button is visible
- [ ] Navigation menu works
- [ ] Pet emoji (🐾) displays in header

### Unauthenticated Access
- [ ] Verify "Get Started" redirects to registration
- [ ] Verify "Sign In" redirects to login
- [ ] Can't access feed, profile, or other protected pages

---

## 🔍 3. Video Search & Discovery

### Search Functionality
- [ ] Navigate to Search page
- [ ] Enter search term (e.g., "cute cats")
- [ ] Press enter or click search
- [ ] Results display with thumbnails
- [ ] Video titles and metadata show correctly
- [ ] Try different search terms
- [ ] Search for non-existent content (verify "No results found")

### Search Results Display
- [ ] Thumbnails are prominent and load correctly
- [ ] Video title displays
- [ ] Channel name displays
- [ ] View count displays
- [ ] Click on a result navigates to video detail

### Search Pagination
- [ ] Scroll to bottom of results
- [ ] "Load More" button appears
- [ ] Click "Load More"
- [ ] Additional results load without page refresh

### Search Edge Cases
- [ ] Search with special characters (e.g., "cat & dog")
- [ ] Search with very long query
- [ ] Search with empty query (should show validation)

---

## 📺 4. Video Playback & Details

### Video Detail Page
- [ ] Click on a video from search or feed
- [ ] Video detail page loads
- [ ] YouTube video player embeds correctly
- [ ] Video metadata displays (title, description, channel)
- [ ] View count displays

### Video Player
- [ ] Video player loads
- [ ] Click play button
- [ ] Video plays without errors
- [ ] Pause button works
- [ ] Volume controls work
- [ ] Fullscreen toggle works
- [ ] Progress bar seeking works

### Video Actions
- [ ] "Add to Playlist" button is visible
- [ ] Click "Add to Playlist"
- [ ] Modal opens with playlist options
- [ ] Share button works (if present)

### Error Handling
- [ ] Navigate to invalid video ID
- [ ] Verify error message displays
- [ ] Retry button appears (if applicable)

---

## 💬 5. Comments

### View Comments
- [ ] Comments section displays below video
- [ ] Existing comments load
- [ ] Comment count is accurate
- [ ] User avatars/names display
- [ ] Timestamps are correct and formatted

### Create Comment
- [ ] Enter comment text in input field
- [ ] Click submit/post button
- [ ] New comment appears immediately at top
- [ ] Comment count increments
- [ ] Try submitting empty comment (should fail with validation)
- [ ] Try very long comment (should enforce 2000 char limit)

### Edit Comment
- [ ] Find your own comment
- [ ] Click "Edit" button
- [ ] Text input appears with current text
- [ ] Modify text
- [ ] Click "Save"
- [ ] Updated text displays
- [ ] "(edited)" indicator appears

### Delete Comment
- [ ] Find your own comment
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears (if present)
- [ ] Confirm deletion
- [ ] Comment is removed immediately
- [ ] Comment count decrements

### Comment Permissions
- [ ] Can only edit/delete your own comments
- [ ] Can't edit other users' comments
- [ ] Edit/delete buttons don't show on others' comments

---

## 📝 6. Playlists

### View Playlists
- [ ] Navigate to Playlists page
- [ ] User's playlists display
- [ ] Playlist cards show thumbnails
- [ ] Video count displays on each playlist
- [ ] Public/private indicator shows

### Create Playlist (Standard)
- [ ] Click "Create Playlist" button
- [ ] Modal/form opens
- [ ] Enter playlist name
- [ ] Enter description (optional)
- [ ] Set privacy (public/private toggle)
- [ ] Submit form
- [ ] New playlist appears in list

### Create Playlist from Video (Inline Creation - NEW!)
**When User Has No Playlists:**
- [ ] Go to any video detail page
- [ ] Click "Add to Playlist"
- [ ] Modal shows "You don't have any playlists yet"
- [ ] Inline form appears with name input
- [ ] Enter playlist name
- [ ] Click "Create Playlist & Add Video"
- [ ] Success message shows with playlist name
- [ ] Modal closes automatically after 1.5 seconds
- [ ] Verify video was added to new playlist

**When User Has Existing Playlists:**
- [ ] Go to any video detail page
- [ ] Click "Add to Playlist"
- [ ] List of existing playlists shows at top
- [ ] Scroll to bottom
- [ ] "Or create a new playlist" section visible
- [ ] Enter new playlist name in bottom form
- [ ] Click "Create & Add"
- [ ] Success message displays
- [ ] Video is added to newly created playlist
- [ ] Can verify by going to Playlists page

### Edit Playlist
- [ ] Click on a playlist
- [ ] Click "Edit" button
- [ ] Update name
- [ ] Update description
- [ ] Change privacy setting
- [ ] Save changes
- [ ] Verify updates display correctly

### Add Videos to Existing Playlist
- [ ] Open a video detail page
- [ ] Click "Add to Playlist"
- [ ] Select an existing playlist from list
- [ ] Success message appears
- [ ] Navigate to that playlist
- [ ] Verify video appears in playlist

### Remove Videos from Playlist
- [ ] Open a playlist
- [ ] Find a video in the playlist
- [ ] Click remove/delete button
- [ ] Confirm removal (if dialog appears)
- [ ] Video is removed from list
- [ ] Video count updates

### Delete Playlist
- [ ] Navigate to Playlists page
- [ ] Click delete on a playlist
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Playlist is removed from list

### Playlist Detail View
- [ ] Click on a playlist
- [ ] Playlist detail page loads
- [ ] All videos in playlist display
- [ ] Video thumbnails and titles show
- [ ] Click on a video navigates to video detail

---

## 👤 7. User Profile

### View Own Profile
- [ ] Click on your profile link/avatar in header
- [ ] Profile page loads
- [ ] Username displays correctly
- [ ] User avatar displays (or default)
- [ ] Bio displays (if set)

### Profile Tabs (All 4 Tabs)

#### Videos Tab
- [ ] Videos tab is selected by default on page load
- [ ] User's shared videos display immediately (no need to switch tabs)
- [ ] Video cards show thumbnails and titles
- [ ] Click on video navigates to detail page
- [ ] If no videos: "No videos yet" empty state shows

#### Playlists Tab
- [ ] Click "Playlists" tab
- [ ] User's playlists display
- [ ] Playlist cards show correctly
- [ ] Video count displays on each playlist
- [ ] Click on playlist opens detail page
- [ ] If no playlists: Empty state with "Create Playlist" option shows

#### Followers Tab
- [ ] Click "Followers" tab
- [ ] List of followers displays
- [ ] User avatars and usernames show
- [ ] Click on user navigates to their profile
- [ ] If no followers: "No followers yet" empty state shows

#### Following Tab
- [ ] Click "Following" tab
- [ ] List of followed users displays
- [ ] User avatars and usernames show
- [ ] Click on user navigates to their profile
- [ ] If no following: "Not following anyone yet" empty state shows

### Tab Switching
- [ ] Switch between all 4 tabs multiple times
- [ ] Data loads correctly each time
- [ ] No duplicate data loading
- [ ] Switching is smooth without flickering

### Edit Profile
- [ ] Click "Edit Profile" button (if present)
- [ ] Update username
- [ ] Update bio
- [ ] Upload/change avatar
- [ ] Save changes
- [ ] Verify updates display on profile

### View Other User's Profile
- [ ] Click on another user's name/avatar (from comment, follower list, etc.)
- [ ] Their profile loads
- [ ] Can't see "Edit Profile" button
- [ ] Can see their public content
- [ ] Follow button is visible

---

## 👥 8. Social Features

### Follow/Unfollow
- [ ] Visit another user's profile
- [ ] Click "Follow" button
- [ ] Button changes to "Following" or "Unfollow"
- [ ] Follower count increments
- [ ] Go to your Following tab - user appears there
- [ ] Click "Following"/"Unfollow" to unfollow
- [ ] Follower count decrements
- [ ] User removed from your Following tab

### Feed (Following Feed)
- [ ] Navigate to "Your Feed" page
- [ ] Videos from followed users display
- [ ] Videos are in chronological order (newest first)
- [ ] Video thumbnails and metadata show
- [ ] Click on video navigates to detail
- [ ] If not following anyone: Empty state message shows

### Notifications
- [ ] Notification bell icon in header
- [ ] Unread notification count shows (red badge)
- [ ] Click notification bell
- [ ] Notifications dropdown/panel opens
- [ ] Recent notifications display
- [ ] Click on notification navigates to related content
- [ ] Mark notification as read

### Share Video
- [ ] Navigate to Share Video page
- [ ] Enter YouTube URL
- [ ] Add title (optional)
- [ ] Add description (optional)
- [ ] Submit
- [ ] Video is shared to your profile
- [ ] Video appears in feed for your followers

---

## 🔔 9. Push Notifications

### Enable Push Notifications
- [ ] Notification prompt appears (after login or on first visit)
- [ ] Click "Enable Notifications"
- [ ] Browser permission dialog appears
- [ ] Accept permission
- [ ] Confirmation/success message shows

### Notification Settings
- [ ] Navigate to Notification Settings page
- [ ] Toggle options are visible (follow, comment, like notifications)
- [ ] Toggle notifications on/off
- [ ] Save preferences
- [ ] Verify preferences persist after page refresh

### Receive Push Notifications
- [ ] Have another user follow you
- [ ] Push notification appears on device
- [ ] Have another user comment on your video
- [ ] Push notification appears
- [ ] Click notification opens app to relevant page

### Disable Push Notifications
- [ ] Go to Notification Settings
- [ ] Disable push notifications
- [ ] Trigger notification event
- [ ] Verify no notification appears

---

## 🛡️ 10. Content Moderation (Admin Only)

### Admin Access
- [ ] Login as admin user
- [ ] Navigate to Moderation page (`/moderation`)
- [ ] Moderation dashboard is accessible

### Flag Content (Regular User)
- [ ] Find a video
- [ ] Click "Report" button (if present)
- [ ] Select reason for flagging
- [ ] Submit report

### Review Flagged Content (Admin)
- [ ] View list of flagged content in moderation dashboard
- [ ] See flag details (reason, reporter)
- [ ] Preview flagged content
- [ ] Click "Approve" (keep content)
- [ ] Click "Remove" (delete content)
- [ ] Action is recorded

### Non-Admin Access
- [ ] Login as regular user
- [ ] Try accessing `/moderation`
- [ ] Should be denied or redirected

---

## 📱 11. Mobile Responsiveness

### Navigation (Mobile)
- [ ] Open app on mobile viewport (or use DevTools, resize to 375px)
- [ ] Header is responsive
- [ ] All header links are accessible
- [ ] Navigation doesn't require horizontal scrolling
- [ ] All menu items fit on screen

### Layout (Mobile)
- [ ] All pages are responsive at 320px width
- [ ] All pages are responsive at 375px width (iPhone)
- [ ] All pages are responsive at 768px width (tablet)
- [ ] Text is readable (minimum 16px font size)
- [ ] Buttons are tappable (minimum 44x44px)
- [ ] Images scale correctly
- [ ] No horizontal scrolling (unless intentional)

### Forms (Mobile)
- [ ] Login form is usable on mobile
- [ ] Registration form is usable on mobile
- [ ] Comment input is usable on mobile
- [ ] Search bar is usable on mobile
- [ ] All inputs zoom correctly (no zoom-in on focus)

### Video Player (Mobile)
- [ ] Video player is responsive
- [ ] Player controls are accessible on mobile
- [ ] Fullscreen works on mobile device

### Touch Interactions
- [ ] Tap interactions are responsive
- [ ] Scrolling is smooth
- [ ] No accidental double-tap zoom

---

## ⚡ 12. Performance

### Page Load Times
- [ ] Landing page loads quickly (< 3 seconds)
- [ ] Feed page loads quickly
- [ ] Video detail page loads quickly
- [ ] Profile page loads quickly
- [ ] Search results appear quickly

### Video Loading
- [ ] Video thumbnails load progressively
- [ ] Video player initializes quickly
- [ ] Video starts playing within 2-3 seconds

### Smooth Interactions
- [ ] Scrolling is smooth on all pages
- [ ] Tab switching is instant
- [ ] Modal open/close is smooth
- [ ] Button clicks are responsive

---

## 🔒 13. Security & Privacy

### Authentication
- [ ] Can't access feed without login
- [ ] Can't access profile without login
- [ ] Can't access playlists without login
- [ ] Auth tokens expire appropriately
- [ ] Session persists across page refreshes

### Authorization
- [ ] Can't edit other users' profiles
- [ ] Can't delete other users' comments
- [ ] Can't edit other users' playlists
- [ ] Admin features only visible to admins

### Data Privacy
- [ ] Private playlists not visible to others
- [ ] User email not exposed in public API
- [ ] Can't access other users' notification settings

### Rate Limiting
- [ ] Multiple failed login attempts trigger rate limit (5 attempts)
- [ ] Rate limit message displays
- [ ] Must wait before trying again

---

## 🌐 14. Progressive Web App (PWA)

### Installation
- [ ] "Install App" prompt appears (in supported browsers)
- [ ] Click install
- [ ] App installs to device
- [ ] Open installed app
- [ ] App opens in standalone mode (no browser UI)

### PWA Manifest
- [ ] App name displays correctly after install
- [ ] App icon displays on home screen/app list
- [ ] Theme color is correct
- [ ] Splash screen appears on launch

### Offline Functionality
- [ ] Open app while online
- [ ] Browse a few pages (feed, profile, video)
- [ ] Disconnect from internet
- [ ] App still loads basic UI
- [ ] Cached content is accessible
- [ ] Offline indicator shows (if implemented)
- [ ] Graceful error messages for unavailable content

### Service Worker
- [ ] Service worker registers successfully (check console)
- [ ] Service worker caches assets
- [ ] Navigate offline and verify cached assets load

### App Updates
- [ ] When new version is deployed
- [ ] Update notification appears (if implemented)
- [ ] Click to refresh and get new version
- [ ] App updates successfully

---

## 🎨 15. UI/UX & Design

### Color Palette
- [ ] Cream background (#F0F0DC) is used
- [ ] Charcoal text (#36454F) is used
- [ ] Light Blue accents (#ADD8E6) are used
- [ ] Color contrast meets accessibility standards

### Visual Consistency
- [ ] Buttons have consistent styling
- [ ] Cards have consistent styling
- [ ] Typography is consistent
- [ ] Spacing is uniform across pages
- [ ] Rounded corners (border-radius) are consistent

### Shadcn UI Components
- [ ] Video cards use Shadcn Card component
- [ ] Search uses Shadcn Input component
- [ ] CTAs use Shadcn Button component
- [ ] Modals use Shadcn Dialog component
- [ ] Tabs use Shadcn Tabs component

### Loading States
- [ ] Loading spinners display during API calls
- [ ] Skeleton loaders for video cards (if implemented)
- [ ] Button shows loading state during submission
- [ ] No blank white screens during loading

### Feedback & Errors
- [ ] Success messages display after actions (green toast)
- [ ] Error messages are clear and helpful (red toast)
- [ ] Form validation errors are specific
- [ ] Network errors have friendly messages

### Animations
- [ ] Page transitions are smooth
- [ ] Modal open/close is smooth
- [ ] Hover effects work on buttons
- [ ] No jarring or too-fast animations

### Empty States
- [ ] "No videos yet" shows when profile has no videos
- [ ] "No playlists yet" shows with create option
- [ ] "No followers yet" shows in followers tab
- [ ] "Not following anyone" shows in following tab
- [ ] "No results found" shows for empty search
- [ ] Empty states have helpful CTAs

---

## 🔗 16. Deep Linking & Routing

### Direct URLs
- [ ] Copy video URL and open in new tab → Video loads correctly
- [ ] Copy profile URL and open in new tab → Profile loads correctly
- [ ] Copy playlist URL and open in new tab → Playlist loads correctly
- [ ] Share video URL with friend → They can access it

### Browser Navigation
- [ ] Back button works correctly on all pages
- [ ] Forward button works correctly
- [ ] Browser history is accurate
- [ ] Page refreshes maintain state (if logged in)

### Protected Routes
- [ ] Direct URL to `/feed` while logged out → Redirects to login
- [ ] Direct URL to `/profile` while logged out → Redirects to login
- [ ] After login from redirect → Redirects back to intended page

---

## 🎯 17. End-to-End User Flows

### New User Journey
1. [ ] Land on homepage
2. [ ] Click "Get Started"
3. [ ] Register new account (email, username, password)
4. [ ] Login automatically or manually
5. [ ] Onboarding tutorial appears (if implemented)
6. [ ] Navigate to Search
7. [ ] Search for "cute cats"
8. [ ] Click on a video
9. [ ] Watch video
10. [ ] Leave a comment
11. [ ] Create first playlist from video (inline creation)
12. [ ] Add video to playlist
13. [ ] Navigate to Profile
14. [ ] View shared playlists
15. [ ] Navigate to Feed
16. [ ] Follow another user
17. [ ] See followed user's videos in feed

### Content Creator Flow
1. [ ] Login to account
2. [ ] Navigate to Share Video page
3. [ ] Enter YouTube URL
4. [ ] Add title and description
5. [ ] Share video
6. [ ] Video appears on profile
7. [ ] Create playlist
8. [ ] Add multiple videos to playlist
9. [ ] Make playlist public
10. [ ] Share playlist with others

### Social Interaction Flow
1. [ ] User A shares a video
2. [ ] User B sees video in feed (if following)
3. [ ] User B clicks video
4. [ ] User B likes video (if implemented)
5. [ ] User B comments on video
6. [ ] User A receives notification
7. [ ] User A clicks notification
8. [ ] User A sees User B's comment
9. [ ] User A replies to comment
10. [ ] User B receives notification

---

## 🐛 Bug Report Template

When you find issues, please provide:

```
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- Browser: 
- Device: 
- OS: 
- Screen Size: 
- URL: 
- Logged In: Yes/No

**Screenshots/Video**:
[Attach if helpful]

**Console Errors**:
[Any errors in browser console - press F12]

**Network Errors**:
[Any failed API calls in Network tab]

**Additional Context**:
[Anything else relevant]
```

---

## ✅ Testing Checklist Summary

### Critical Path (Must Work Perfectly)
- [ ] User registration
- [ ] User login/logout
- [ ] Password reset flow (forgot password → email → reset → login)
- [ ] Video search with YouTube API
- [ ] Video playback
- [ ] Comment creation and deletion
- [ ] Create playlist (standard + inline)
- [ ] Add video to playlist
- [ ] User profile displays correctly
- [ ] All 4 profile tabs load data (Videos, Playlists, Followers, Following)
- [ ] Follow/unfollow users
- [ ] Feed shows followed users' videos

### High Priority
- [ ] Edit comments
- [ ] Edit playlists
- [ ] Push notifications subscribe/unsubscribe
- [ ] Share videos to profile
- [ ] Mobile responsiveness on all pages
- [ ] PWA installation
- [ ] Notification bell with unread count
- [ ] Error handling throughout

### Medium Priority
- [ ] Content moderation (admin)
- [ ] Notification settings page
- [ ] Profile edit functionality
- [ ] Playlist privacy settings
- [ ] Rate limiting on login

### Nice to Have
- [ ] Offline PWA functionality
- [ ] Service worker caching
- [ ] Skeleton loading states
- [ ] Smooth animations

---

## ⚠️ Known Limitations & Future Features

The following features are **NOT currently implemented** but were mentioned in the PRD or are planned for future:

### Not Implemented:
1. ~~**Password Reset Flow**~~ ✅ **NOW IMPLEMENTED!** (Complete flow with email → reset link → new password)
2. **Threaded Comment Replies** - Comments exist but no nested/threaded replies
3. **Video Categories/Filters** - No category filtering on search/feed
4. **Trending Section** - No trending videos page
5. **Autoplay Next Video in Playlist** - Manual navigation only
6. **Advanced Search Filters** - No filter by upload date, duration, etc.
7. **Video Like/Upvote** - No like functionality on videos (only comments)
8. **Watch Time Tracking** - No analytics on watch duration
9. **TV Casting** - Cast button exists in code but functionality not fully tested
10. **Theme Preferences** - No dark mode or theme switching
11. **Email Verification on Signup** - Supabase handles this but not explicitly tested
12. **Hamburger Menu for Mobile** - Mobile responsive but no hamburger menu yet

### Partially Implemented:
- **Onboarding Tutorial** - Components exist but may not trigger automatically
- **Pull-to-Refresh** - Depends on browser support
- **Social Sharing** - Share button exists but full social media integration unclear

---

## 🎯 Success Criteria

The application is ready for production when:

✅ All **Critical Path** features work without errors  
✅ No console errors during normal usage  
✅ Mobile experience is smooth on 320px, 375px, and 768px widths  
✅ Performance is acceptable (page loads < 3 seconds on good connection)  
✅ Authentication & authorization work correctly  
✅ No data loss or corruption during normal operations  
✅ Error messages are user-friendly (no stack traces shown)  
✅ UI is polished and uses correct color palette  
✅ All 4 profile tabs load correctly on initial visit  
✅ Inline playlist creation works in both scenarios (no playlists, existing playlists)  

---

## 📞 How to Report Issues

1. **Check browser console** (F12) for errors
2. **Check Network tab** (F12 → Network) for failed API calls
3. **Check backend logs** in your terminal for server errors
4. **Document** using the bug report template above
5. **Include screenshots/videos** if helpful
6. **Note environment** (browser, device, screen size)

---

## 🚀 Testing Priority Order

**Test in this order for efficiency:**

1. **Authentication** (must work first)
2. **Search & Video Playback** (core feature)
3. **Comments** (key engagement feature)
4. **Playlists** (including new inline creation)
5. **Profile Tabs** (all 4 tabs)
6. **Follow/Feed** (social features)
7. **Mobile Responsiveness**
8. **Push Notifications**
9. **PWA Features**
10. **Edge Cases & Error Handling**

---

**Happy Testing! 🎉**

Last Updated: November 17, 2025
