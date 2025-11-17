import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playlistService } from '../services/playlist';
import { tagService } from '../services/tag';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { EditPlaylistModal } from '../components/EditPlaylistModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Edit2 } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  videos: any[];
}

export function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [addingTagFor, setAddingTagFor] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
      loadTags();
    }
  }, [playlistId]);

  const loadPlaylist = async () => {
    if (!playlistId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await playlistService.getPlaylist(playlistId);
      setPlaylist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    if (!playlistId) return;

    try {
      const data = await tagService.getPlaylistTags(playlistId);
      setTags(data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const handleAddTag = async (videoId: string) => {
    if (!playlistId || !newTagName.trim()) return;

    try {
      const tag = await tagService.addTag(playlistId, videoId, newTagName);
      setTags([...tags, tag]);
      setNewTagName('');
      setAddingTagFor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagService.deleteTag(tagId);
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  const getVideoTags = (videoId: string) => {
    return tags.filter((t) => t.video_id === videoId);
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (!playlistId) return;

    try {
      await playlistService.removeVideo(playlistId, videoId);
      if (playlist) {
        setPlaylist({
          ...playlist,
          videos: playlist.videos.filter((v) => v.id !== videoId),
        });
      }
      setVideoToRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove video');
    }
  };

  const handleUpdatePlaylist = (updated: Playlist) => {
    setPlaylist(updated);
  };

  const isOwner = user?.id === playlist?.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading playlist...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6">
              {error}
            </div>
          )}

          {playlist && (
            <>
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      {playlist.name}
                    </h1>
                    <p className="text-muted-foreground">
                      {playlist.is_public ? '🌐 Public' : '🔒 Private'} •{' '}
                      {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <Button
                        variant="outline"
                        onClick={() => setShowEditModal(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Link to="/playlists">
                      <Button variant="outline">Back to Playlists</Button>
                    </Link>
                  </div>
                </div>

                {playlist.description && (
                  <p className="text-muted-foreground">{playlist.description}</p>
                )}
              </div>

              {playlist.videos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📹</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No videos in this playlist
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwner
                      ? 'Add videos to this playlist from the video detail page'
                      : 'This playlist is empty'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {playlist.videos.map((video, index) => (
                    <Card key={video.id}>
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={video.thumbnail_url || 'https://via.placeholder.com/320x180'}
                            alt={video.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm text-muted-foreground mb-1">
                                  #{index + 1}
                                </div>
                                <CardTitle className="text-lg">{video.title}</CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {video.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {video.description}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {getVideoTags(video.id).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary"
                                  >
                                    {tag.tag_name}
                                    {isOwner && (
                                      <button
                                        onClick={() => handleDeleteTag(tag.id)}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>

                              {isOwner && (
                                <>
                                  {addingTagFor === video.id ? (
                                    <div className="flex space-x-2">
                                      <Input
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder="Tag name..."
                                        maxLength={50}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleAddTag(video.id);
                                          }
                                        }}
                                        className="text-sm h-8"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddTag(video.id)}
                                        disabled={!newTagName.trim()}
                                      >
                                        Add
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setAddingTagFor(null);
                                          setNewTagName('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setAddingTagFor(video.id)}
                                      className="text-xs"
                                    >
                                      + Add Tag
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <a
                                href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm">Watch on YouTube</Button>
                              </a>
                              <Link to={`/video/${video.id}`}>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </Link>
                              {isOwner && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setVideoToRemove(video.id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !error && !playlist && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Playlist not found
              </h3>
              <Link to="/playlists">
                <Button>Back to Playlists</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Edit Playlist Modal */}
      {showEditModal && playlist && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePlaylist}
        />
      )}

      {/* Confirm Remove Video Dialog */}
      {videoToRemove && (
        <ConfirmDialog
          title="Remove Video"
          message="Are you sure you want to remove this video from the playlist?"
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => handleRemoveVideo(videoToRemove)}
          onCancel={() => setVideoToRemove(null)}
        />
      )}
    </div>
  );
}

