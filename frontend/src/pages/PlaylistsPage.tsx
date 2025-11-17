import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistService } from '../services/playlist';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    is_public: true,
  });
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await playlistService.getPlaylists();
      setPlaylists(result.playlists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylist.name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const created = await playlistService.createPlaylist(
        newPlaylist.name,
        newPlaylist.description || undefined,
        newPlaylist.is_public
      );
      setPlaylists([created, ...playlists]);
      setNewPlaylist({ name: '', description: '', is_public: true });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (playlistId: string) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
      setPlaylistToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Playlists</h1>
              <p className="text-muted-foreground">
                Organize your favorite pet videos into playlists
              </p>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Playlist
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6">
              {error}
            </div>
          )}

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Playlist</CardTitle>
                <CardDescription>Add a new playlist to organize your videos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Playlist Name *</Label>
                    <Input
                      id="name"
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                      placeholder="My Favorite Cats"
                      maxLength={100}
                      disabled={creating}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                      placeholder="A collection of my favorite cat videos..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      maxLength={500}
                      disabled={creating}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newPlaylist.is_public}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                      disabled={creating}
                    />
                    <Label htmlFor="is_public" className="cursor-pointer">
                      Make this playlist public
                    </Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={creating || !newPlaylist.name.trim()}>
                      {creating ? 'Creating...' : 'Create Playlist'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewPlaylist({ name: '', description: '', is_public: true });
                      }}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading playlists...</p>
            </div>
          )}

          {!loading && playlists.length === 0 && !showCreateForm && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No playlists yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first playlist to start organizing videos!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Playlist
              </Button>
            </div>
          )}

          {!loading && playlists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <Card key={playlist.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{playlist.name}</CardTitle>
                        <CardDescription>
                          {playlist.is_public ? '🌐 Public' : '🔒 Private'} •{' '}
                          {new Date(playlist.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Link to={`/playlists/${playlist.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPlaylistToDelete(playlist.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirm Delete Dialog */}
      {playlistToDelete && (
        <ConfirmDialog
          title="Delete Playlist"
          message="Are you sure you want to delete this playlist? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => handleDelete(playlistToDelete)}
          onCancel={() => setPlaylistToDelete(null)}
        />
      )}
    </div>
  );
}

