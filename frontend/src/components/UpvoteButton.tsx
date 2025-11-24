import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { API_URL } from '../config/api';

interface UpvoteButtonProps {
  videoId: string;
  initialVoteCount?: number;
  className?: string;
}

type VoteType = 'upvote' | 'downvote' | null;

export function UpvoteButton({ videoId, initialVoteCount = 0, className = '' }: UpvoteButtonProps) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState<VoteType>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserVote();
    }
  }, [user, videoId]);

  const loadUserVote = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/videos/${videoId}/vote`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.vote) {
          setUserVote(data.vote.vote_type);
        }
      }
    } catch (error) {
      console.error('Failed to load user vote:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      // Could show a toast or redirect to login
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // If clicking the same vote type, remove the vote
      if (userVote === voteType) {
        const response = await fetch(`${API_URL}/api/videos/${videoId}/vote`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          // Update local state
          const adjustment = voteType === 'upvote' ? -1 : 1;
          setVoteCount(prev => prev + adjustment);
          setUserVote(null);
        }
      } else {
        // Vote or change vote
        const response = await fetch(`${API_URL}/api/videos/${videoId}/vote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ voteType }),
        });

        if (response.ok) {
          // Update local state
          let adjustment = 0;
          if (userVote === null) {
            // First vote
            adjustment = voteType === 'upvote' ? 1 : -1;
          } else {
            // Changing vote
            adjustment = voteType === 'upvote' ? 2 : -2;
          }
          setVoteCount(prev => prev + adjustment);
          setUserVote(voteType);
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant={userVote === 'upvote' ? 'default' : 'ghost'}
        size="sm"
        className={`h-8 w-8 p-0 ${userVote === 'upvote' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading || !user}
        title={!user ? 'Sign in to vote' : 'Upvote'}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>

      <span className={`text-sm font-semibold min-w-[2rem] text-center ${
        userVote === 'upvote' ? 'text-orange-500' : 
        userVote === 'downvote' ? 'text-blue-500' : 
        'text-foreground'
      }`}>
        {voteCount}
      </span>

      <Button
        variant={userVote === 'downvote' ? 'default' : 'ghost'}
        size="sm"
        className={`h-8 w-8 p-0 ${userVote === 'downvote' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading || !user}
        title={!user ? 'Sign in to vote' : 'Downvote'}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
}

