import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoService } from '../services/video';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Comments } from '../components/Comments';
import { FollowButton } from '../components/FollowButton';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { CastButton } from '../components/CastButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { Video } from '../types';

export function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    if (videoId) {
      loadVideo();
    }
  }, [videoId]);

  const loadVideo = async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await videoService.getVideo(videoId);
      setVideo(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6">
              {error}
            </div>
          )}

          {video && (
            <div className="space-y-6">
              {/* Video Player with Cast Button */}
              <div className="space-y-3">
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {/* Cast Button */}
                {user && (
                  <div className="flex justify-end">
                    <CastButton
                      videoId={video.youtube_video_id}
                      videoTitle={video.title}
                      thumbnailUrl={video.thumbnail_url || ''}
                    />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          (video as any).user?.profile_picture_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.user_id}`
                        }
                        alt={(video as any).user?.username || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {(video as any).user?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Shared {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <FollowButton userId={video.user_id} currentUserId={user?.id} />
                  </div>
                </CardHeader>
                <CardContent>
                  {video.description && (
                    <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                      {video.description}
                    </p>
                  )}
                  
                  {user && (
                    <Button
                      onClick={() => setShowPlaylistModal(true)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      📝 Add to Playlist
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <div>
                <Comments videoId={videoId!} />
              </div>
            </div>
          )}

          {!loading && !error && !video && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Video not found
              </h3>
              <Link to="/feed">
                <Button>Back to Feed</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && videoId && (
        <AddToPlaylistModal
          videoId={videoId}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}

