import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { videoService } from '../services/video';
import { youtubeAPI } from '../services/youtube';
import type { YouTubeVideo } from '../types';

interface ShareVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onSuccess?: () => void;
}

export function ShareVideoModal({ isOpen, onClose, videoId, onSuccess }: ShareVideoModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<YouTubeVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen && videoId) {
      loadVideoData();
    }
  }, [isOpen, videoId]);

  const loadVideoData = async () => {
    setLoadingVideo(true);
    setError(null);
    try {
      const data = await youtubeAPI.getVideoById(videoId);
      setVideoData(data);
      setFormData({
        title: data.title,
        description: data.description || '',
      });
    } catch (err) {
      setError('Failed to load video details');
      console.error('Error loading video:', err);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoData) return;

    setLoading(true);
    setError(null);

    try {
      await videoService.shareVideo({
        youtube_id: videoId,
        title: formData.title,
        description: formData.description,
        thumbnail_url: videoData.thumbnail,
        channel_title: videoData.channelTitle,
        published_at: videoData.publishedAt,
      });

      // Success - close modal and trigger callback
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
      // Reset form
      setFormData({ title: '', description: '' });
      setVideoData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to share video');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset state after modal closes
      setTimeout(() => {
        setFormData({ title: '', description: '' });
        setVideoData(null);
        setError(null);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Video to Petflix</DialogTitle>
          <DialogDescription>
            Add this video to your Petflix profile and share it with the community
          </DialogDescription>
        </DialogHeader>

        {loadingVideo ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : videoData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Video title"
                required
                disabled={loading}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description (optional)"
                rows={4}
                disabled={loading}
                className="resize-none"
              />
            </div>

            {/* Channel Info */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Channel:</span> {videoData.channelTitle}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="w-full sm:w-auto"
              >
                {loading ? 'Sharing...' : 'Share to Petflix'}
              </Button>
            </DialogFooter>
          </form>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

