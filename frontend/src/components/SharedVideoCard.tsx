import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Video } from '../types';

interface SharedVideoCardProps {
  video: Video;
}

export function SharedVideoCard({ video }: SharedVideoCardProps) {
  return (
    <Link to={`/video/${video.id}`}>
      <Card className="overflow-hidden hover-lift fade-in cursor-pointer h-full flex flex-col">
        <div className="relative aspect-video">
          <img
            src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="p-4 flex-shrink-0">
          <CardTitle className="text-base line-clamp-2">
            {video.title}
          </CardTitle>
          {video.user && (
            <p className="text-xs text-muted-foreground mt-1">
              by {video.user.username}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(video.created_at).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}

