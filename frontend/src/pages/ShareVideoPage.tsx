import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { youtubeAPI } from '../services/youtube';
import { videoService } from '../services/video';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Header } from '../components/Header';

export function ShareVideoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    // If videoId is in URL params, fetch and preview it
    const videoId = searchParams.get('videoId');
    if (videoId) {
      setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`);
      validateAndPreview(`https://www.youtube.com/watch?v=${videoId}`);
    }
  }, [searchParams]);

  const validateAndPreview = async (url: string) => {
    if (!url) {
      setPreview(null);
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await youtubeAPI.validateYouTubeUrl(url);
      if (result.valid && result.video) {
        setPreview(result.video);
        if (!title) setTitle(result.video.title);
        if (!description) setDescription(result.video.description || '');
      } else {
        setError(result.message || 'Invalid YouTube URL');
        setPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate URL');
      setPreview(null);
    } finally {
      setValidating(false);
    }
  };

  const handleUrlBlur = () => {
    validateAndPreview(youtubeUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await videoService.shareVideo(youtubeUrl, title, description);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share video');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Share a Pet Video</CardTitle>
              <CardDescription>
                Share your favorite pet videos from YouTube with the Petflix community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">
                  Video shared successfully! Redirecting to your profile...
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    disabled={loading}
                    required
                  />
                  {validating && (
                    <p className="text-xs text-foreground/60">Validating URL...</p>
                  )}
                </div>

                {preview && (
                  <div className="border border-lightblue/30 rounded-lg p-4 bg-lightblue/5">
                    <p className="text-sm font-semibold text-foreground mb-2">Preview:</p>
                    <div className="flex space-x-4">
                      <img
                        src={preview.thumbnail}
                        alt={preview.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {preview.title}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {preview.channelTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Leave blank to use YouTube title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add your own description or leave blank to use YouTube description"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={loading || validating || !preview}>
                    {loading ? 'Sharing...' : 'Share Video'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

