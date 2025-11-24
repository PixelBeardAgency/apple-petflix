import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { youtubeAPI } from '../services/youtube';
import { profileService } from '../services/profile';
import type { YouTubeVideo, User } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Header } from '../components/Header';
import { VideoPreviewModal } from '../components/VideoPreviewModal';
import { ShareVideoModal } from '../components/ShareVideoModal';
import { EmptyState } from '../components/EmptyState';
import { debounce } from '../lib/utils';
import { Search, Users, Play } from 'lucide-react';

export function SearchPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'users'>('videos');
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'relevance' | 'date' | 'viewCount' | 'rating'>('relevance');
  const [previewVideo, setPreviewVideo] = useState<YouTubeVideo | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

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

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await profileService.searchProfiles(searchQuery);
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for videos
  const debouncedVideoSearch = React.useMemo(
    () => debounce((q: string) => searchVideos(q), 500),
    [sortOrder]
  );

  // Debounced search for users
  const debouncedUserSearch = React.useMemo(
    () => debounce((q: string) => searchUsers(q), 500),
    []
  );

  useEffect(() => {
    if (query) {
      if (activeTab === 'videos') {
        debouncedVideoSearch(query);
      } else {
        debouncedUserSearch(query);
      }
    } else {
      setVideos([]);
      setUsers([]);
    }
  }, [query, activeTab, debouncedVideoSearch, debouncedUserSearch]);

  const handleShareClick = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShareModalOpen(true);
  };

  const handleShareSuccess = () => {
    // Optionally show success message or refresh
    console.log('Video shared successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Search
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find pet videos and users
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder={activeTab === 'videos' ? "Search for pet videos..." : "Search for users..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-base sm:text-lg py-4 sm:py-6"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'videos' | 'users')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos">
                <Search className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-6">
              {/* Sort Options */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-6">
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
                      <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
                              <Play className="w-6 h-6 text-gray-900 fill-gray-900" />
                            </div>
                          </div>
                        </div>
                        <CardHeader className="flex-shrink-0">
                          <CardTitle className="text-base line-clamp-2">
                            {video.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {video.channelTitle}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {video.description}
                          </p>
                          {user && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleShareClick(video.id)}
                            >
                              Share to Petflix
                            </Button>
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
            </TabsContent>

            <TabsContent value="users" className="mt-6">
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
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Search for users
                  </h3>
                  <p className="text-muted-foreground">
                    Find other pet lovers on Petflix!
                  </p>
                </div>
              )}

              {/* User Results */}
              {users.length > 0 && (
                <div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Found {users.length} users for "{query}"
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {users.map((foundUser) => (
                      <Link key={foundUser.id} to={`/profile/${foundUser.id}`}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={
                                  foundUser.profile_picture_url ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.id}`
                                }
                                alt={foundUser.username}
                                className="w-16 h-16 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {foundUser.username}
                                </h3>
                                {foundUser.bio && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {foundUser.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && !loading && users.length === 0 && !error && (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description="Try a different search term"
                />
              )}
            </TabsContent>
          </Tabs>
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

      {/* Share Video Modal */}
      {selectedVideoId && (
        <ShareVideoModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedVideoId(null);
          }}
          videoId={selectedVideoId}
          onSuccess={handleShareSuccess}
        />
      )}
    </div>
  );
}

