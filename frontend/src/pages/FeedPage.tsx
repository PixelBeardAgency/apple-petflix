import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedService } from '../services/feed';
import type { Video } from '../types';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function FeedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await feedService.getFeed();
      setVideos(result.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Your Feed</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Videos from users you follow
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-muted-foreground">Loading your feed...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {!loading && !error && videos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">📭</div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Your feed is empty
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
                Follow other users to see their shared videos here!
              </p>
              <Link to="/search">
                <Button className="text-sm sm:text-base">Discover Videos</Button>
              </Link>
            </div>
          )}

          {!loading && videos.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                      <img
                        src={video.thumbnail_url || 'https://via.placeholder.com/320x180'}
                        alt={video.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="w-full md:w-2/3">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">{video.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Shared by{' '}
                          <Link
                            to={`/user/${video.user_id}`}
                            className="hover:underline font-medium"
                          >
                            {(video as any).user?.username || 'Unknown'}
                          </Link>{' '}
                          •{' '}
                          {new Date(video.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                        {video.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                            {video.description}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none"
                          >
                            <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Watch on YouTube</Button>
                          </a>
                          <Link to={`/video/${video.id}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                              View Comments
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

