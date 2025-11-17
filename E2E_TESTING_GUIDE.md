# 🧪 Petflix - End-to-End Testing Guide

This document provides a comprehensive testing checklist for all Petflix features. Use this to systematically test the application and identify any issues.

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
- [ ] Check welcome notification/message
- [ ] Verify redirect to appropriate page

### Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] Verify successful login
- [ ] Check user is redirected to feed
- [ ] Verify auth token is stored

### Logout
- [ ] Click logout button
- [ ] Verify redirect to login/home
- [ ] Verify session is cleared
- [ ] Try accessing protected routes (should redirect)

### Password Reset (if implemented)
- [ ] Request password reset
- [ ] Check email received
- [ ] Follow reset link
- [ ] Set new password
- [ ] Login with new password

---

## 🏠 2. Home/Landing Page

### Initial Load
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Call-to-action buttons are visible
- [ ] Navigation menu works

### Unauthenticated User
- [ ] Sign up button is visible
- [ ] Login button is visible
- [ ] Can't access protected features

---

## 📺 3. Video Discovery & Feed

### Feed Page
- [ ] Navigate to "Your Feed"
- [ ] Videos load correctly
- [ ] Thumbnail images display
- [ ] Video titles and metadata show
- [ ] Scroll triggers infinite loading (if implemented)
- [ ] "Load More" button works (if present)

### Video Search
- [ ] Open search bar
- [ ] Enter search term (e.g., "cute cats")
- [ ] Press enter or click search
- [ ] Results display correctly
- [ ] Try different search terms
- [ ] Search for non-existent content
- [ ] Clear search and return to feed

### Video Categories/Filters (if implemented)
- [ ] Select different categories
- [ ] Filter by pet type (cats, dogs, etc.)
- [ ] Verify filtered results match selection
- [ ] Clear filters

---

## 🎬 4. Video Playback & Details

### Video Detail Page
- [ ] Click on a video thumbnail
- [ ] Video detail page loads
- [ ] Video player appears
- [ ] Video metadata displays (title, description, views, date)
- [ ] Creator/channel info shows

### Video Player
- [ ] Click play button
- [ ] Video plays without errors
- [ ] Pause button works
- [ ] Volume controls work
- [ ] Fullscreen toggle works
- [ ] Quality settings work (if available)
- [ ] Playback speed controls work (if available)

### Video Actions
- [ ] Like button works
- [ ] Like count updates immediately
- [ ] Unlike by clicking again
- [ ] Share button opens share modal
- [ ] Copy link to clipboard
- [ ] Add to playlist button works

---

## 💬 5. Comments

### View Comments
- [ ] Comments section displays below video
- [ ] Existing comments load
- [ ] Comment count is accurate
- [ ] User avatars display
- [ ] Timestamps are correct

### Create Comment
- [ ] Enter comment text
- [ ] Submit comment
- [ ] New comment appears immediately
- [ ] Comment count increments
- [ ] Try submitting empty comment (should fail)
- [ ] Try very long comment (test limits)

### Edit Comment (if implemented)
- [ ] Click edit on your comment
- [ ] Modify text
- [ ] Save changes
- [ ] Verify updated text displays

### Delete Comment
- [ ] Click delete on your comment
- [ ] Confirm deletion
- [ ] Comment is removed
- [ ] Comment count decrements

### Comment Interactions
- [ ] Like a comment
- [ ] Unlike a comment
- [ ] Reply to a comment (if threaded)
- [ ] View nested replies

---

## 📝 6. Playlists

### View Playlists
- [ ] Navigate to Playlists page
- [ ] User's playlists display
- [ ] Playlist thumbnails show
- [ ] Video count is accurate
- [ ] Public/private indicator shows

### Create Playlist
- [ ] Click "Create Playlist" button
- [ ] Enter playlist name
- [ ] Enter description (optional)
- [ ] Set privacy (public/private)
- [ ] Submit form
- [ ] New playlist appears in list

### Create Playlist from Video (Inline Creation)
- [ ] Go to any video
- [ ] Click "Add to Playlist"
- [ ] If no playlists: form appears to create one
- [ ] Enter playlist name
- [ ] Click "Create Playlist & Add Video"
- [ ] Verify playlist created and video added
- [ ] Success message displays

### Create Playlist When Playlists Exist
- [ ] Click "Add to Playlist" on a video
- [ ] Scroll to "Or create a new playlist" section
- [ ] Enter new playlist name
- [ ] Click "Create & Add"
- [ ] Verify new playlist created and video added

### Edit Playlist
- [ ] Click edit on a playlist
- [ ] Update name
- [ ] Update description
- [ ] Change privacy setting
- [ ] Save changes
- [ ] Verify updates display

### Add Videos to Playlist
- [ ] Open a video detail page
- [ ] Click "Add to Playlist"
- [ ] Select a playlist
- [ ] Verify video is added
- [ ] Check video appears in playlist

### Remove Videos from Playlist
- [ ] Open a playlist
- [ ] Click remove on a video
- [ ] Confirm removal
- [ ] Video is removed from list
- [ ] Video count updates

### Delete Playlist
- [ ] Click delete on a playlist
- [ ] Confirm deletion
- [ ] Playlist is removed from list

### Play Playlist
- [ ] Open a playlist
- [ ] Click play on first video
- [ ] Video plays
- [ ] Check if autoplay to next video works (if implemented)

---

## 👤 7. User Profile

### View Own Profile
- [ ] Click on profile link/avatar
- [ ] Profile page loads
- [ ] User info displays (username, avatar, bio)
- [ ] Profile stats show (followers, following, videos)

### Profile Tabs

#### Videos Tab
- [ ] Tab loads by default
- [ ] Shared videos display
- [ ] Video cards show thumbnails and metadata
- [ ] Click on video navigates to detail page
- [ ] Empty state shows if no videos

#### Playlists Tab
- [ ] Click Playlists tab
- [ ] User's playlists display
- [ ] Playlist cards show correctly
- [ ] Click on playlist opens it
- [ ] Empty state shows if no playlists

#### Followers Tab
- [ ] Click Followers tab
- [ ] List of followers displays
- [ ] User avatars and usernames show
- [ ] Click on user navigates to their profile
- [ ] Empty state shows if no followers

#### Following Tab
- [ ] Click Following tab
- [ ] List of followed users displays
- [ ] User avatars and usernames show
- [ ] Click on user navigates to their profile
- [ ] Empty state shows if not following anyone

### Edit Profile
- [ ] Click "Edit Profile" button
- [ ] Update username
- [ ] Update bio
- [ ] Upload/change avatar
- [ ] Save changes
- [ ] Verify updates display

### View Other User's Profile
- [ ] Click on another user's name/avatar
- [ ] Their profile loads
- [ ] Can't see edit button
- [ ] Can see their public content
- [ ] Follow button is visible

---

## 👥 8. Social Features

### Follow/Unfollow
- [ ] Visit another user's profile
- [ ] Click "Follow" button
- [ ] Button changes to "Following"
- [ ] Follower count updates
- [ ] Click "Following" to unfollow
- [ ] Confirm unfollowing
- [ ] Counts update

### Notifications
- [ ] Trigger notification (like, comment, follow, etc.)
- [ ] Bell icon shows unread count
- [ ] Click notification bell
- [ ] Dropdown/page shows notifications
- [ ] Click on notification navigates to related content
- [ ] Mark notification as read
- [ ] Mark all as read

### Share Video
- [ ] Click share button on video
- [ ] Share modal opens
- [ ] Copy link button works
- [ ] Social media buttons work (if implemented)
- [ ] Close modal

---

## 🔔 9. Push Notifications

### Enable Push Notifications
- [ ] Prompt appears to enable notifications
- [ ] Click "Enable Notifications"
- [ ] Browser permission dialog appears
- [ ] Accept permission
- [ ] Confirmation message shows

### Receive Push Notifications
- [ ] Have another user trigger notification (comment, like, follow)
- [ ] Push notification appears on device
- [ ] Click notification opens app to relevant page

### Disable Push Notifications
- [ ] Access notification settings
- [ ] Disable push notifications
- [ ] Verify notifications stop

---

## 🛡️ 10. Content Moderation (Admin)

### Admin Access
- [ ] Login as admin user
- [ ] Admin menu/section is visible
- [ ] Navigate to moderation dashboard

### Flag Content
- [ ] Flag a video as inappropriate
- [ ] Flag a comment as spam
- [ ] Reason for flagging is required
- [ ] Flag is submitted

### Review Flagged Content (Admin)
- [ ] View list of flagged content
- [ ] See flag details (reason, reporter)
- [ ] Preview flagged content
- [ ] Approve or remove content
- [ ] Action is recorded

### Block User (Admin)
- [ ] Search for user
- [ ] Click block/ban
- [ ] Enter reason
- [ ] Confirm action
- [ ] User is blocked from actions

---

## 🔍 11. Search & Discovery

### Global Search
- [ ] Click search icon/bar
- [ ] Enter search term
- [ ] Results show videos matching query
- [ ] Results show users (if implemented)
- [ ] Results show playlists (if implemented)
- [ ] Click on result navigates correctly

### Advanced Filters (if implemented)
- [ ] Filter by upload date
- [ ] Filter by duration
- [ ] Filter by views/popularity
- [ ] Sort results (relevance, date, views)

### Trending/Popular
- [ ] Navigate to trending section
- [ ] Popular videos display
- [ ] Based on views/likes/recent activity

---

## 📱 12. Mobile Responsiveness

### Navigation
- [ ] Open app on mobile viewport (or use DevTools)
- [ ] Hamburger menu appears on small screens
- [ ] Click hamburger menu
- [ ] Navigation drawer/menu opens
- [ ] All links are accessible
- [ ] Close menu by clicking outside or close button

### Layout
- [ ] All pages are responsive
- [ ] Text is readable (no tiny fonts)
- [ ] Buttons are tappable (min 44px)
- [ ] Images scale correctly
- [ ] No horizontal scrolling (unless intentional)
- [ ] Forms are usable

### Video Player
- [ ] Video player is responsive
- [ ] Controls are accessible on mobile
- [ ] Fullscreen works on mobile

### Touch Interactions
- [ ] Swipe gestures work (if implemented)
- [ ] Tap interactions are responsive
- [ ] No double-tap zoom issues

---

## ⚡ 13. Performance

### Page Load Times
- [ ] Home page loads quickly (< 3 seconds)
- [ ] Feed page loads quickly
- [ ] Video detail page loads quickly
- [ ] Profile page loads quickly

### Video Loading
- [ ] Video thumbnails load quickly
- [ ] Video player initializes quickly
- [ ] Video starts playing within 2-3 seconds

### Infinite Scroll/Pagination
- [ ] Scrolling is smooth
- [ ] New content loads without freezing
- [ ] Loading indicators show during fetch

### Caching
- [ ] Revisit pages load from cache
- [ ] Images are cached
- [ ] API responses are cached (where appropriate)

---

## 🔒 14. Security & Privacy

### Authentication
- [ ] Can't access protected routes without login
- [ ] Auth tokens expire appropriately
- [ ] Session management works correctly

### Authorization
- [ ] Can't edit other users' content
- [ ] Can't delete other users' comments
- [ ] Admin features only visible to admins
- [ ] API endpoints respect permissions

### Data Privacy
- [ ] Private playlists not visible to others
- [ ] User email not exposed publicly
- [ ] Profile privacy settings work (if implemented)

---

## 🌐 15. Progressive Web App (PWA)

### Installation
- [ ] "Install App" prompt appears
- [ ] Click install
- [ ] App installs to device
- [ ] Open installed app
- [ ] Works as standalone app

### Offline Functionality
- [ ] Disconnect from internet
- [ ] App still loads
- [ ] Cached content is accessible
- [ ] Offline indicator shows
- [ ] Graceful error messages for unavailable content

### Service Worker
- [ ] Service worker registers successfully
- [ ] Updates are detected
- [ ] Update prompt appears when new version available
- [ ] Refresh to get new version works

---

## 🐛 16. Error Handling

### Network Errors
- [ ] Disconnect internet during API call
- [ ] Appropriate error message displays
- [ ] Retry button available
- [ ] App doesn't crash

### Invalid Data
- [ ] Enter invalid form data
- [ ] Validation errors show
- [ ] Submit empty required fields
- [ ] Field-specific errors display

### 404 Not Found
- [ ] Navigate to non-existent route
- [ ] 404 page displays
- [ ] "Go Home" link works

### API Errors
- [ ] Trigger API error (e.g., rate limit)
- [ ] Error message is user-friendly
- [ ] Technical details not exposed
- [ ] App recovers gracefully

---

## 🎨 17. UI/UX

### Visual Consistency
- [ ] Consistent color scheme throughout
- [ ] Fonts are consistent
- [ ] Button styles match
- [ ] Spacing is uniform

### Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Alt text on images
- [ ] ARIA labels where appropriate
- [ ] Color contrast meets WCAG standards

### Animations
- [ ] Transitions are smooth
- [ ] Loading spinners display during waits
- [ ] Hover effects work
- [ ] No jarring/too-fast animations

### Feedback
- [ ] Success messages display after actions
- [ ] Error messages are clear
- [ ] Loading states show for async operations
- [ ] Disabled states are obvious

---

## 🔗 18. Deep Linking & Routing

### Direct URLs
- [ ] Copy video URL and open in new tab
- [ ] Video loads correctly
- [ ] Copy profile URL and open in new tab
- [ ] Profile loads correctly
- [ ] Copy playlist URL and open in new tab
- [ ] Playlist loads correctly

### Browser Navigation
- [ ] Back button works correctly
- [ ] Forward button works correctly
- [ ] Browser history is accurate
- [ ] Page state is preserved

---

## 💾 19. Data Persistence

### Local Storage
- [ ] Preferences are saved (theme, settings)
- [ ] Auth tokens persist across sessions
- [ ] Form data is preserved (if implemented)

### Session Management
- [ ] Login state persists across page refreshes
- [ ] Session expires after inactivity (if implemented)
- [ ] Re-login prompt appears when session expires

---

## 📊 20. Analytics & Tracking (if implemented)

### View Tracking
- [ ] Video views are counted
- [ ] View count increments
- [ ] Watch time is tracked

### Engagement Metrics
- [ ] Likes are tracked
- [ ] Comments are counted
- [ ] Shares are tracked

---

## 🧪 Testing Different Scenarios

### New User Flow
1. Register new account
2. Verify email (if required)
3. Complete onboarding
4. Browse feed
5. Watch first video
6. Create first playlist
7. Add video to playlist
8. Follow a user
9. Comment on a video

### Power User Flow
1. Login to existing account
2. Check notifications
3. View own profile
4. Create new playlist
5. Add multiple videos to playlist
6. Share a video
7. Comment on multiple videos
8. Follow several users
9. Check followers/following

### Social Interaction Flow
1. User A creates and shares video
2. User B sees video in feed
3. User B likes and comments
4. User A receives notification
5. User A replies to comment
6. User B follows User A
7. User A follows back

---

## 📝 Bug Report Template

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

**Screenshots/Video**:
[Attach if helpful]

**Console Errors**:
[Any errors in browser console]

**Additional Context**:
[Anything else relevant]
```

---

## ✅ Testing Checklist Summary

### Critical Path (Must Work)
- [ ] User registration
- [ ] User login
- [ ] Video feed loads
- [ ] Video playback works
- [ ] Create playlist
- [ ] Add video to playlist
- [ ] User profile displays correctly
- [ ] Profile tabs load data (Videos, Playlists, Followers, Following)

### High Priority
- [ ] Search functionality
- [ ] Comments system
- [ ] Follow/unfollow
- [ ] Notifications
- [ ] Mobile responsiveness
- [ ] Inline playlist creation

### Medium Priority
- [ ] Push notifications
- [ ] PWA features
- [ ] Content moderation
- [ ] Advanced filters

### Nice to Have
- [ ] Trending section
- [ ] Analytics
- [ ] Themes/preferences
- [ ] Advanced social features

---

## 🎯 Success Criteria

The application is ready for production when:

✅ All critical path features work without errors  
✅ No console errors in normal usage  
✅ Mobile experience is smooth and usable  
✅ Performance is acceptable (page loads < 3 sec)  
✅ Authentication & authorization work correctly  
✅ No data loss or corruption  
✅ Error messages are user-friendly  
✅ UI is polished and consistent  

---

## 📞 Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check backend logs for API errors
3. Document using bug report template above
4. Report to development team

Happy Testing! 🚀

