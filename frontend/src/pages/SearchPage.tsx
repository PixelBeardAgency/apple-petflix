import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { youtubeAPI } from '../services/youtube';
import type { YouTubeVideo } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/Header';
import { VideoPreviewModal } from '../components/VideoPreviewModal';
import { debounce } from '../lib/utils';

export function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'relevance' | 'date' | 'viewCount' | 'rating'>('relevance');
  const [previewVideo, setPreviewVideo] = useState<YouTubeVideo | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchVideos = async (searchQuery: string, pageToken?: string) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      setNextPageToken(null);
      return;
    }

    if (pageToken) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await youtubeAPI.searchVideos(searchQuery, 20, sortOrder, pageToken);
      if (pageToken) {
        // Append to existing videos
        setVideos(prev => [...prev, ...result.videos]);
      } else {
        // Replace videos
        setVideos(result.videos);
      }
      setNextPageToken(result.nextPageToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search videos');
      if (!pageToken) {
        setVideos([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreVideos = () => {
    if (nextPageToken && query) {
      searchVideos(query, nextPageToken);
    }
  };

  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((q: string) => searchVideos(q), 500),
    [sortOrder]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Search Pet Videos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find adorable pet videos from YouTube
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 space-y-4">
            <Input
              type="text"
              placeholder="Search for pet videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-base sm:text-lg py-4 sm:py-6"
            />

            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'date', label: 'Recent' },
                  { value: 'viewCount', label: 'Popular' },
                  { value: 'rating', label: 'Top Rated' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortOrder === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortOrder(option.value as any)}
                    className="flex-1 sm:flex-none"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Searching...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6">
              {error}
            </div>
          )}

          {/* No Query State */}
          {!query && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start searching for pet videos
              </h3>
              <p className="text-muted-foreground">
                Try searching for "funny cats", "puppy training", or your favorite pet!
              </p>
            </div>
          )}

          {/* Results */}
          {videos.length > 0 && (
            <div>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {videos.length} videos for "{query}"
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="relative aspect-video cursor-pointer group"
                      onClick={() => setPreviewVideo(video)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-charcoal border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
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
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {video.description}
                      </p>
                      {user && (
                        <Link to={`/share?videoId=${video.id}`}>
                          <Button size="sm" className="w-full">
                            Share to Petflix
                          </Button>
                        </Link>
                      )}
                      {!user && (
                        <Link to="/register">
                          <Button size="sm" variant="outline" className="w-full">
                            Sign up to share
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {nextPageToken && (
                <div className="mt-8 text-center">
                  <Button 
                    onClick={loadMoreVideos}
                    disabled={loadingMore}
                    size="lg"
                    variant="outline"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Videos'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {query && !loading && videos.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😿</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No videos found
              </h3>
              <p className="text-muted-foreground">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Video Preview Modal */}
      {previewVideo && (
        <VideoPreviewModal
          videoId={previewVideo.id}
          videoTitle={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  );
}

