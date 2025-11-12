import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onShare?: () => void;
  showShareButton?: boolean;
  isAuthenticated?: boolean;
}

export function VideoCard({ video, onShare, showShareButton = true, isAuthenticated = false }: VideoCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-base line-clamp-2">
          {video.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {video.channelTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {video.description && (
          <p className="text-sm text-charcoal/70 line-clamp-2 mb-3">
            {video.description}
          </p>
        )}
        {video.viewCount && (
          <p className="text-xs text-charcoal/60 mb-3">
            {formatViews(parseInt(video.viewCount))} views
          </p>
        )}
        {showShareButton && (
          <>
            {isAuthenticated ? (
              <Button size="sm" className="w-full" onClick={onShare}>
                Share to Petflix
              </Button>
            ) : (
              <Link to="/register">
                <Button size="sm" variant="outline" className="w-full">
                  Sign up to share
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to format ISO 8601 duration (PT1H2M10S) to readable format
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(hours);
  parts.push(minutes || '0');
  parts.push(seconds || '0');

  return parts.map(p => p.padStart(2, '0')).join(':');
}

// Helper to format view count
function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

