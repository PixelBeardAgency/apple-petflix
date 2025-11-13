import React, { useState, useEffect } from 'react';
import { Cast, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { castService } from '../services/cast';
import type { CastDevice, CastSession } from '../services/cast';

interface CastButtonProps {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  className?: string;
}

export function CastButton({ videoId, videoTitle, thumbnailUrl, className = '' }: CastButtonProps) {
  const [session, setSession] = useState<CastSession | null>(null);
  const [devices, setDevices] = useState<CastDevice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize cast service
    castService.initialize().catch(err => {
      console.error('Failed to initialize cast service:', err);
    });

    // Subscribe to session changes
    const unsubscribe = castService.subscribe(setSession);

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Load devices when popover opens
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-cast when connected to a device
    if (session?.state === 'connected' && session.videoId !== videoId) {
      handleCastVideo();
    }
  }, [session, videoId]);

  const loadDevices = async () => {
    try {
      const availableDevices = await castService.getAvailableDevices();
      setDevices(availableDevices);
      
      if (availableDevices.length === 0) {
        setError('No cast devices found. Make sure your device is on the same network.');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Failed to load cast devices');
      console.error('Failed to load devices:', err);
    }
  };

  const handleConnect = async (device: CastDevice) => {
    setLoading(true);
    setError(null);

    try {
      await castService.connect(device);
      // Device connection successful, now cast the video
      await handleCastVideo();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      console.error('Failed to connect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCastVideo = async () => {
    try {
      await castService.castVideo(videoId, videoTitle, thumbnailUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast video');
      console.error('Failed to cast video:', err);
    }
  };

  const handleDisconnect = () => {
    castService.disconnect();
    setIsOpen(false);
  };

  const handleTogglePlay = async () => {
    try {
      await castService.togglePlayPause();
    } catch (err) {
      console.error('Failed to toggle play/pause:', err);
    }
  };

  // Don't show button if casting is not available
  if (!castService.isCastAvailable()) {
    return null;
  }

  const isConnected = session?.state === 'connected';
  const isConnecting = session?.state === 'connecting';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isConnected ? 'default' : 'outline'}
          size="icon"
          className={className}
          title={isConnected ? 'Connected to cast device' : 'Cast to TV'}
        >
          <Cast className={`h-4 w-4 ${isConnected ? 'fill-current' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              {isConnected ? 'Cast Controls' : 'Cast to Device'}
            </h3>
            {error && (
              <div className="p-2 rounded-md bg-destructive/15 text-destructive text-sm mb-2">
                {error}
              </div>
            )}
          </div>

          {isConnected ? (
            // Connected state - show controls
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <Wifi className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {session.device.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.device.type === 'chromecast' ? 'Chromecast' : 'AirPlay'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleTogglePlay}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={session.device.type === 'airplay'}
                >
                  Play/Pause
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </div>

              {session.device.type === 'airplay' && (
                <p className="text-xs text-muted-foreground text-center">
                  Use the video player controls to manage AirPlay playback
                </p>
              )}
            </div>
          ) : (
            // Not connected - show device list
            <div className="space-y-2">
              {loading || isConnecting ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {isConnecting ? 'Connecting...' : 'Loading devices...'}
                  </p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-4">
                  <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No devices found
                  </p>
                  <Button
                    onClick={loadDevices}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select a device to start casting:
                  </p>
                  {devices.map((device) => (
                    <Button
                      key={device.id}
                      onClick={() => handleConnect(device)}
                      variant="outline"
                      className="w-full justify-start"
                      disabled={loading}
                    >
                      <Cast className="h-4 w-4 mr-2" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.type === 'chromecast' ? 'Chromecast' : 'AirPlay'}
                        </p>
                      </div>
                    </Button>
                  ))}
                </>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {isConnected ? (
                'Casting is active. The video is playing on your TV.'
              ) : (
                'Make sure your device is on the same network as your cast device.'
              )}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

