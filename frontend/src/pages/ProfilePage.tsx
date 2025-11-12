import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { followService } from '../services/follow';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/Header';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    profile_picture_url: profile?.profile_picture_url || '',
  });

  useEffect(() => {
    if (profile?.id) {
      loadFollowCounts();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
      const { error } = await updateProfile({
        username: formData.username,
        bio: formData.bio || undefined,
        profile_picture_url: formData.profile_picture_url || undefined,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setEditing(false);
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                  <Input
                    id="profile_picture_url"
                    type="url"
                    value={formData.profile_picture_url}
                    onChange={(e) =>
                      setFormData({ ...formData, profile_picture_url: e.target.value })
                    }
                    disabled={loading}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={profile.profile_picture_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.id}
                    alt={profile.username}
                    className="w-20 h-20 rounded-full border-2 border-primary"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{profile.username}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex space-x-4 mt-2 text-sm">
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
                    <h4 className="font-semibold text-foreground mb-2">Bio</h4>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>

                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for videos, playlists, etc. */}
        <div className="mt-8 text-center p-8 rounded-lg bg-muted border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Your shared videos, playlists, and followers will appear here in future updates.
          </p>
        </div>
      </main>
    </div>
  );
}

