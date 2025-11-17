import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { followService } from '../services/follow';
import { videoService } from '../services/video';
import { playlistService } from '../services/playlist';
import { profileService } from '../services/profile';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Header } from '../components/Header';
import { SharedVideoCard } from '../components/SharedVideoCard';
import { EmptyState } from '../components/EmptyState';
import { VideoCardSkeleton } from '../components/VideoCardSkeleton';
import type { Video, Playlist, Profile, User } from '../types';
import { Video as VideoIcon, List, Users, UserPlus, Upload, X } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user, profile: currentUserProfile, signOut, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determine which profile to display
  const profile = viewedProfile || currentUserProfile;
  const isOwnProfile = !userId || userId === user?.id;

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    profile_picture_url: profile?.profile_picture_url || '',
  });

  // Tab content state
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Load viewed user's profile if userId is provided
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userId && userId !== user?.id) {
        setLoading(true);
        try {
          const userProfile = await profileService.getProfile(userId);
          setViewedProfile(userProfile);
          
          // Check if current user is following this profile
          if (user?.id) {
            const followStatus = await followService.getFollowStatus(userId);
            setIsFollowing(followStatus);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      } else {
        setViewedProfile(null);
      }
    };

    loadUserProfile();
  }, [userId, user?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadFollowCounts();
      // Load the default tab (Videos) on mount
      loadVideos();
    }
  }, [profile?.id]);

  const loadFollowCounts = async () => {
    if (!profile?.id) return;

    try {
      const [followers, following] = await Promise.all([
        followService.getFollowers(profile.id, 1, 0),
        followService.getFollowing(profile.id, 1, 0),
      ]);
      setFollowerCount(followers.total);
      setFollowingCount(following.total);
    } catch (error) {
      console.error('Failed to load follow counts:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    if (!profile?.id || loadingVideos || videos.length > 0) return;
    setLoadingVideos(true);
    try {
      const result = await videoService.getUserVideos(profile.id);
      setVideos(result);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadPlaylists = async () => {
    if (!profile?.id || loadingPlaylists || playlists.length > 0) return;
    setLoadingPlaylists(true);
    try {
      const result = await playlistService.getPlaylists(20, 0);
      setPlaylists(result.playlists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const loadFollowers = async () => {
    if (!profile?.id || loadingFollowers || followers.length > 0) return;
    setLoadingFollowers(true);
    try {
      const result = await followService.getFollowers(profile.id, 20, 0);
      setFollowers(result.followers);
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const loadFollowing = async () => {
    if (!profile?.id || loadingFollowing || following.length > 0) return;
    setLoadingFollowing(true);
    try {
      const result = await followService.getFollowing(profile.id, 20, 0);
      setFollowing(result.following);
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    setSelectedFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validation
    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      setLoading(false);
      return;
    }

    if (formData.bio && formData.bio.length > 255) {
      setError('Bio must be 255 characters or less');
      setLoading(false);
      return;
    }

    try {
      let profilePictureUrl = formData.profile_picture_url;

      // If a file was selected, upload it first
      if (selectedFile && user?.id) {
        setUploading(true);
        try {
          // Delete old picture if it exists and is from storage
          if (profile?.profile_picture_url && profile.profile_picture_url.includes('/avatars/')) {
            await profileService.deleteProfilePicture(profile.profile_picture_url);
          }

          // Upload new picture
          profilePictureUrl = await profileService.uploadProfilePicture(selectedFile, user.id);
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image');
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const { error } = await updateProfile({
        username: formData.username,
        bio: formData.bio || undefined,
        profile_picture_url: profilePictureUrl || undefined,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      bio: profile?.bio || '',
      profile_picture_url: profile?.profile_picture_url || '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditing(false);
    setError(null);
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">My Profile</CardTitle>
            <CardDescription className="text-sm">
              {editing ? 'Update your profile information' : 'View your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">
                Profile updated successfully!
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={loading}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/255 characters
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm sm:text-base">Profile Picture</Label>
                  
                  {/* File Upload Option */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={loading || uploading}
                      className="hidden"
                    />
                    
                    {/* Preview or Upload Button */}
                    {previewUrl || selectedFile ? (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl || ''}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={loading || uploading}
                          className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || uploading}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or GIF. Max 2MB.
                    </p>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  {/* URL Option */}
                  <div className="space-y-2">
                    <Label htmlFor="profile_picture_url" className="text-sm">Use Image URL</Label>
                    <Input
                      id="profile_picture_url"
                      type="url"
                      value={formData.profile_picture_url}
                      onChange={(e) =>
                        setFormData({ ...formData, profile_picture_url: e.target.value })
                      }
                      disabled={loading || uploading || selectedFile !== null}
                      placeholder="https://example.com/avatar.jpg"
                      className="text-sm sm:text-base"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Remove uploaded file to use URL instead
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                  <Button type="submit" disabled={loading || uploading} className="w-full sm:w-auto">
                    {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <img
                    src={profile.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.id}
                    alt={profile.username}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-primary flex-shrink-0"
                  />
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{profile.username}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground break-all">{user.email}</p>
                    <div className="flex justify-center sm:justify-start space-x-4 mt-2 text-sm">
                      <span className="text-foreground">
                        <strong>{followerCount}</strong> followers
                      </span>
                      <span className="text-foreground">
                        <strong>{followingCount}</strong> following
                      </span>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Bio</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">{profile.bio}</p>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>

                {isOwnProfile ? (
                  <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">Edit Profile</Button>
                ) : (
                  <Button 
                    onClick={handleFollowToggle}
                    variant={isFollowing ? 'outline' : 'default'}
                    className="w-full sm:w-auto"
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for videos, playlists, etc. */}
        <div className="mt-6 sm:mt-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="videos" onClick={loadVideos}>
                <VideoIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="playlists" onClick={loadPlaylists}>
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Playlists</span>
              </TabsTrigger>
              <TabsTrigger value="followers" onClick={loadFollowers}>
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Followers</span>
              </TabsTrigger>
              <TabsTrigger value="following" onClick={loadFollowing}>
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Following</span>
              </TabsTrigger>
            </TabsList>

            {/* Videos Tab */}
            <TabsContent value="videos" className="mt-6">
              {loadingVideos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <SharedVideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={VideoIcon}
                  title="No videos yet"
                  description="Share some videos to see them here!"
                  action={{
                    label: "Search Videos",
                    onClick: () => navigate('/search')
                  }}
                />
              )}
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="mt-6">
              {loadingPlaylists ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {playlists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      to={`/playlists/${playlist.id}`}
                      className="block rounded-lg border border-border hover:border-primary transition-colors overflow-hidden"
                    >
                      {/* Thumbnail */}
                      {playlist.thumbnail_url ? (
                        <div className="aspect-video w-full bg-muted relative">
                          <img
                            src={playlist.thumbnail_url}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Video count overlay */}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {playlist.video_count || 0} {playlist.video_count === 1 ? 'video' : 'videos'}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <div className="text-3xl mb-1">📝</div>
                            <p className="text-xs">No videos yet</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-base text-foreground line-clamp-1">{playlist.name}</h3>
                        {playlist.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{playlist.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {playlist.is_public ? '🌐 Public' : '🔒 Private'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={List}
                  title="No playlists yet"
                  description="Create playlists to organize your videos!"
                  action={{
                    label: "View Playlists",
                    onClick: () => navigate('/playlists')
                  }}
                />
              )}
            </TabsContent>

            {/* Followers Tab */}
            <TabsContent value="followers" className="mt-6">
              {loadingFollowers ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((follower) => (
                    <Link
                      key={follower.id}
                      to={`/profile/${follower.id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={follower.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.id}`}
                        alt={follower.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{follower.username}</h4>
                        {follower.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{follower.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No followers yet"
                  description="Share great content to gain followers!"
                />
              )}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-6">
              {loadingFollowing ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : following.length > 0 ? (
                <div className="space-y-4">
                  {following.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{user.username}</h4>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserPlus}
                  title="Not following anyone yet"
                  description="Follow users to see their content in your feed!"
                  action={{
                    label: "Discover Users",
                    onClick: () => navigate('/search')
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

