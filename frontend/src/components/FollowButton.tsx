import React, { useState, useEffect } from 'react';
import { followService } from '../services/follow';
import { Button } from './ui/button';

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
}

export function FollowButton({ userId, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    if (!currentUserId || userId === currentUserId) {
      setChecking(false);
      return;
    }

    try {
      const status = await followService.getFollowStatus(userId);
      setIsFollowing(status);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if viewing own profile or not logged in
  if (checking || !currentUserId || userId === currentUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}

