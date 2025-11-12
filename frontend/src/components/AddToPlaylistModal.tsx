import React, { useState, useEffect } from 'react';
import { playlistService } from '../services/playlist';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
}

interface AddToPlaylistModalProps {
  videoId: string;
  onClose: () => void;
}

export function AddToPlaylistModal({ videoId, onClose }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const result = await playlistService.getPlaylists(100, 0);
      setPlaylists(result.playlists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    setAdding(playlistId);
    setError(null);
    setSuccess(null);

    try {
      await playlistService.addVideo(playlistId, videoId);
      setSuccess(`Added to "${playlistName}"`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to playlist');
    } finally {
      setAdding(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Add to Playlist</CardTitle>
            <CardDescription>Choose a playlist to add this video to</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm mb-4">
                {success}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any playlists yet.</p>
                <Button onClick={onClose}>Close</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                    disabled={adding === playlist.id}
                    className="w-full text-left p-3 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-foreground">{playlist.name}</div>
                    {playlist.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {playlist.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={onClose} disabled={!!adding}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

