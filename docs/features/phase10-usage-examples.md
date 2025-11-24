# Phase 10: UI/UX Polish - Usage Examples

This document provides practical examples of how to use the Phase 10 components in your application.

## Table of Contents
1. [Toast Notifications](#toast-notifications)
2. [Loading Skeletons](#loading-skeletons)
3. [Empty States](#empty-states)
4. [Confirmation Dialogs](#confirmation-dialogs)
5. [Animations](#animations)
6. [Complete Example Page](#complete-example-page)

---

## Toast Notifications

### Basic Success Toast

```tsx
import { useToast } from '@/hooks/use-toast';

function ShareButton() {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await shareVideo(videoUrl);
      toast({
        title: "Success!",
        description: "Video shared with the community",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return <Button onClick={handleShare}>Share Video</Button>;
}
```

### Toast with Action Button

```tsx
const handleUnfollow = async (userId: string) => {
  await unfollowUser(userId);
  
  toast({
    title: "Unfollowed",
    description: "You've unfollowed this user",
    action: {
      label: "Undo",
      onClick: () => followUser(userId),
    },
  });
};
```

### Toast Variants

```tsx
// Success (default)
toast({
  title: "Done!",
  description: "Your changes have been saved",
});

// Error
toast({
  title: "Oops!",
  description: "Something went wrong",
  variant: "destructive",
});

// Info (using default variant with custom styling)
toast({
  title: "Heads up!",
  description: "New features are available",
});
```

---

## Loading Skeletons

### Video Grid Loading State

```tsx
import { VideoGridSkeleton } from '@/components/VideoCardSkeleton';

function FeedPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos().then(data => {
      setVideos(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
        <VideoGridSkeleton count={9} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
```

### Comments Loading State

```tsx
import { CommentsListSkeleton } from '@/components/CommentSkeleton';

function CommentsSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <CommentsListSkeleton count={5} />;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
```

### Custom Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      {/* Bio */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      {/* Stats */}
      <div className="flex space-x-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
```

---

## Empty States

### No Videos Found

```tsx
import { EmptyState } from '@/components/EmptyState';
import { VideoOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MyVideos() {
  const navigate = useNavigate();
  const videos = []; // Empty array

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={VideoOff}
        title="No videos yet"
        description="Share your first video to get started with Petflix!"
        action={{
          label: "Share Video",
          onClick: () => navigate('/share')
        }}
      />
    );
  }

  return <VideoGrid videos={videos} />;
}
```

### Search No Results

```tsx
import { Search } from 'lucide-react';

function SearchResults({ query, results }: { query: string; results: any[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`We couldn't find any videos matching "${query}". Try different keywords.`}
        action={{
          label: "Clear Search",
          onClick: () => setQuery('')
        }}
        secondaryAction={{
          label: "Browse All Videos",
          onClick: () => navigate('/feed')
        }}
      />
    );
  }

  return <VideoGrid videos={results} />;
}
```

### No Followers

```tsx
import { Users } from 'lucide-react';

function FollowersList() {
  const followers = [];

  if (followers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No followers yet"
        description="Share interesting videos to attract followers!"
        action={{
          label: "Explore Videos",
          onClick: () => navigate('/feed')
        }}
      />
    );
  }

  return <FollowerGrid followers={followers} />;
}
```

---

## Confirmation Dialogs

### Delete Confirmation

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useState } from 'react';

function VideoActions({ videoId }: { videoId: string }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVideo(videoId);
      toast({
        title: "Video deleted",
        description: "Your video has been removed",
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
      >
        Delete Video
      </Button>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Video?"
        description="This action cannot be undone. The video will be permanently removed from Petflix."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </>
  );
}
```

### Unfollow Confirmation

```tsx
function UnfollowButton({ userId, username }: { userId: string; username: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnfollow = async () => {
    setLoading(true);
    await unfollowUser(userId);
    setLoading(false);
    setShowConfirm(false);
    toast({
      title: "Unfollowed",
      description: `You've unfollowed ${username}`,
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowConfirm(true)}>
        Unfollow
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleUnfollow}
        title={`Unfollow ${username}?`}
        description="You won't see their videos in your feed anymore."
        confirmText="Unfollow"
        variant="default"
        loading={loading}
      />
    </>
  );
}
```

### Logout Confirmation

```tsx
function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        Logout
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="You'll need to log back in to access your account."
        confirmText="Log Out"
        variant="default"
      />
    </>
  );
}
```

---

## Animations

### Applying Animations to Components

```tsx
// Fade in effect
<div className="fade-in">
  <VideoCard video={video} />
</div>

// Slide up effect
<div className="slide-up">
  <CommentItem comment={comment} />
</div>

// Scale in effect
<div className="scale-in">
  <Modal />
</div>

// Hover lift effect
<Card className="hover-lift">
  <CardContent>
    Hover over me!
  </CardContent>
</Card>

// Smooth transitions
<Button className="transition-smooth">
  Click me
</Button>

// Focus ring
<input className="focus-ring" />
```

### Staggered List Animation

```tsx
function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="fade-in"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'backwards'
          }}
        >
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
}
```

---

## Complete Example Page

Here's a complete example combining all Phase 10 features:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoGridSkeleton } from '@/components/VideoCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/VideoCard';
import type { Video } from '@/types';

export function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load videos
  useEffect(() => {
    loadMyVideos()
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load your videos",
          variant: "destructive",
        });
      });
  }, []);

  // Delete video
  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      await deleteVideo(deleteId);
      setVideos(prev => prev.filter(v => v.id !== deleteId));
      toast({
        title: "Video deleted",
        description: "Your video has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6 fade-in">
        <h1 className="text-3xl font-bold mb-6">My Videos</h1>
        <VideoGridSkeleton count={6} />
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="container mx-auto py-6 fade-in">
        <h1 className="text-3xl font-bold mb-6">My Videos</h1>
        <EmptyState
          icon={VideoOff}
          title="No videos yet"
          description="Start sharing your favorite pet videos with the community!"
          action={{
            label: "Share Your First Video",
            onClick: () => navigate('/share')
          }}
          secondaryAction={{
            label: "Browse Videos",
            onClick: () => navigate('/feed')
          }}
        />
      </div>
    );
  }

  // Video grid
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <Button onClick={() => navigate('/share')}>
          Share New Video
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <div className="relative group">
              <VideoCard video={video} className="hover-lift" />
              
              {/* Delete button (appears on hover) */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setDeleteId(video.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Video?"
        description="This action cannot be undone. The video will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
```

---

## Best Practices

### 1. Toast Notifications
- ✅ Show toasts for all user actions (save, delete, share, etc.)
- ✅ Use descriptive titles and messages
- ✅ Use `variant="destructive"` for errors
- ❌ Don't show toasts for navigation or simple UI changes

### 2. Loading Skeletons
- ✅ Match skeleton structure to actual content
- ✅ Show skeletons immediately (no delay)
- ✅ Use appropriate count (6-9 for grids, 3-5 for lists)
- ❌ Don't show skeletons for < 1 second loads (use instant render)

### 3. Empty States
- ✅ Provide clear title and description
- ✅ Include actionable CTAs
- ✅ Use appropriate icons
- ❌ Don't leave users stuck with no action

### 4. Confirmation Dialogs
- ✅ Use for all destructive actions
- ✅ Make consequences clear
- ✅ Show loading state during action
- ❌ Don't overuse for simple actions

### 5. Animations
- ✅ Keep animations subtle and quick (< 300ms)
- ✅ Use consistent timing
- ✅ Respect `prefers-reduced-motion`
- ❌ Don't animate everything (causes distraction)

---

## Accessibility Notes

- All components are keyboard accessible
- Focus management is built-in
- ARIA labels are included
- Color contrast meets WCAG AA standards
- Screen reader announcements work correctly
- ESC key closes dialogs
- Reduced motion is respected

---

For more information, see the [Phase 10 Summary](./phase10-ui-ux-polish-summary.md).

