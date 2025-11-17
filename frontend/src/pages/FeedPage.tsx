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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video) => (
                <Link key={video.id} to={`/video/${video.id}`}>
                  <Card className="overflow-hidden hover-lift fade-in cursor-pointer h-full">
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">
                        {video.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Shared by{' '}
                        <Link
                          to={`/profile/${video.user_id}`}
                          className="hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(video as any).user?.username || 'Unknown'}
                        </Link>
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    {video.description && (
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

