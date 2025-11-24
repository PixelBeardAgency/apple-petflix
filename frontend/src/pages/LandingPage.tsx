import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { youtubeAPI } from '../services/youtube';
import { VideoCardSkeleton } from '../components/VideoCardSkeleton';
import type { YouTubeVideo } from '../types';
import { Play, ArrowUp, ArrowDown } from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadTrendingVideos = async () => {
    setLoadingTrending(true);
    setTrendingError(null);
    try {
      console.log('Loading trending videos from:', `${import.meta.env.VITE_API_URL || ''}/api/youtube/trending`);
      const result = await youtubeAPI.getTrendingVideos(12);
      console.log('Trending videos result:', result);
      console.log('Videos array:', result.videos);
      console.log('Videos count:', result.videos?.length);
      
      if (result.videos && Array.isArray(result.videos)) {
        setTrendingVideos(result.videos);
        console.log('State updated with', result.videos.length, 'videos');
      } else {
        console.error('Invalid videos data structure:', result);
        setTrendingError('Invalid data received from API');
      }
    } catch (err) {
      console.error('Failed to load trending videos:', err);
      setTrendingError(err instanceof Error ? err.message : 'Failed to load trending videos');
    } finally {
      setLoadingTrending(false);
      console.log('Loading complete. State:', { 
        loading: false, 
        videosCount: trendingVideos.length,
        error: trendingError 
      });
    }
  };

  // Debug: Log current state
  console.log('Render state:', {
    loadingTrending,
    trendingError,
    trendingVideosCount: trendingVideos.length,
    trendingVideos: trendingVideos.slice(0, 2) // First 2 videos for inspection
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Hero Text */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Discover & Share
              <br />
              <span className="text-lightblue">Adorable Pet Videos</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Join a community of pet lovers. Search, share, and enjoy the cutest pet videos
              from YouTube.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link to="/search" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                🔍 Search for Pet Videos
              </Button>
            </Link>
            {!user && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                  Create Account
                </Button>
              </Link>
            )}
          </div>

          {/* Hero Image/Illustration Placeholder */}
          <div className="mt-8 sm:mt-12 rounded-lg bg-lightblue/20 p-8 sm:p-12 border border-lightblue/30">
            <div className="text-4xl sm:text-6xl">🐶 🐱 🐰 🐹 🦜 🐠</div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Your favorite pet videos, all in one place
            </p>
          </div>
        </div>

        {/* Trending Videos Section */}
        <div className="mt-16 sm:mt-24 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              🔥 Trending Pet Videos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Check out what's popular right now in the pet community
            </p>
          </div>

          {loadingTrending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {trendingError && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-muted-foreground mb-2">{trendingError}</p>
              <p className="text-sm text-muted-foreground">
                Unable to load trending videos. Please check back later or search for pet videos.
              </p>
            </div>
          )}

          {!loadingTrending && !trendingError && trendingVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingVideos.map((video) => (
                <div key={video.id} className="group cursor-pointer">
                  {/* Video Thumbnail */}
                  <Link 
                    to={user ? `/share?videoId=${video.id}` : '/login'}
                    className="block relative aspect-video rounded-lg overflow-hidden bg-muted mb-2"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </Link>

                  {/* Video Info */}
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={user ? `/share?videoId=${video.id}` : '/login'}
                        className="block"
                      >
                        <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {video.channelTitle}
                        </p>
                      </Link>
                    </div>

                    {/* Upvote/Downvote */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!user) {
                            window.location.href = '/login';
                          }
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title={user ? "Upvote" : "Sign in to vote"}
                      >
                        <ArrowUp className="h-4 w-4 text-muted-foreground hover:text-orange-500" />
                      </button>
                      <span className="text-xs font-medium text-foreground">0</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!user) {
                            window.location.href = '/login';
                          }
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title={user ? "Downvote" : "Sign in to vote"}
                      >
                        <ArrowDown className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state when no videos */}
        {!loadingTrending && !trendingError && trendingVideos.length === 0 && (
          <div className="mt-16 sm:mt-24 max-w-7xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No trending videos available right now
            </h3>
            <p className="text-muted-foreground mb-6">
              Check back soon or search for your favorite pet videos!
            </p>
            <Link to="/search">
              <Button size="lg">
                🔍 Search Pet Videos
              </Button>
            </Link>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Search & Discover</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find pet videos from YouTube with powerful search and filters
            </p>
          </div>
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">💬</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Share & Engage</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Share your favorites and comment on videos with fellow pet lovers
            </p>
          </div>
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">👥</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Follow & Connect</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Follow users with similar tastes and build your pet video community
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">
            Why Petflix?
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">📱</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Progressive Web App</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Install Petflix on your phone or desktop for a native app experience
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">🔔</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Stay Updated</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Get notifications when your favorite creators share new videos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">📺</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">TV Casting</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Cast videos to your TV with Chromecast or AirPlay
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">🎯</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Create Playlists</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Organize your favorite pet videos into custom playlists
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="mt-16 sm:mt-24 text-center p-8 sm:p-12 rounded-lg bg-lightblue/10 border border-lightblue/30 mx-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to join the fun?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Create your free account and start sharing pet videos today!
            </p>
            <Link to="/register">
              <Button size="lg" className="text-sm sm:text-base">Get Started Free</Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 mt-16 sm:mt-24">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-xs sm:text-sm">
              © 2025 Petflix. All rights reserved.
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

