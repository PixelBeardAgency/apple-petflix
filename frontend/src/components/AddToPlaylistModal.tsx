import React, { useState, useEffect } from 'react';
import { playlistService } from '../services/playlist';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';

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
  const [creating, setCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // Create the new playlist
      const newPlaylist = await playlistService.createPlaylist({
        name: newPlaylistName.trim(),
        description: '',
        is_public: true,
      });

      // Add the video to the newly created playlist
      await playlistService.addVideo(newPlaylist.id, videoId);
      
      setSuccess(`Created "${newPlaylist.name}" and added video!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    } finally {
      setCreating(false);
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
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">You don't have any playlists yet.</p>
                  <p className="text-sm text-muted-foreground">Create one now and add this video to it!</p>
                </div>
                
                <form onSubmit={handleCreateAndAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playlistName">Playlist Name</Label>
                    <Input
                      id="playlistName"
                      placeholder="e.g., My Favorite Pet Videos"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      disabled={creating}
                      autoFocus
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={creating || !newPlaylistName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {creating ? 'Creating...' : 'Create Playlist & Add Video'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Existing playlists */}
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

                {/* Create new playlist section */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Or create a new playlist:</p>
                  <form onSubmit={handleCreateAndAdd} className="space-y-3">
                    <Input
                      placeholder="New playlist name..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      disabled={creating}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={creating || !newPlaylistName.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {creating ? 'Creating...' : 'Create & Add'}
                    </Button>
                  </form>
                </div>
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

