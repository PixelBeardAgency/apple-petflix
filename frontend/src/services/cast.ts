/**
 * Cast Service
 * Handles TV casting to Chromecast and AirPlay devices
 */

export type CastDevice = {
  id: string;
  name: string;
  type: 'chromecast' | 'airplay';
};

export type CastState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type CastSession = {
  device: CastDevice;
  state: CastState;
  videoId: string | null;
};

class CastService {
  private session: CastSession | null = null;
  private listeners: Array<(session: CastSession | null) => void> = [];
  private castContext: any = null;
  private remotePlayer: any = null;
  private remotePlayerController: any = null;

  /**
   * Initialize cast service and load Chromecast SDK
   */
  async initialize(): Promise<void> {
    // Check if Google Cast SDK is available
    if (typeof window !== 'undefined' && (window as any).chrome?.cast) {
      try {
        await this.initializeChromecast();
      } catch (error) {
        console.error('Failed to initialize Chromecast:', error);
      }
    }
  }

  /**
   * Initialize Chromecast using Google Cast SDK
   */
  private async initializeChromecast(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cast = (window as any).chrome.cast;
      const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
      const apiConfig = new cast.ApiConfig(
        sessionRequest,
        this.sessionListener.bind(this),
        this.receiverListener.bind(this)
      );

      cast.initialize(
        apiConfig,
        () => {
          console.log('Chromecast initialized');
          this.castContext = cast.framework?.CastContext.getInstance();
          this.setupRemotePlayer();
          resolve();
        },
        (error: any) => {
          console.error('Chromecast initialization failed:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Setup remote player for Chromecast controls
   */
  private setupRemotePlayer(): void {
    if ((window as any).chrome?.cast?.framework) {
      const cast = (window as any).chrome.cast.framework;
      this.remotePlayer = new cast.RemotePlayer();
      this.remotePlayerController = new cast.RemotePlayerController(this.remotePlayer);
      
      // Listen for player state changes
      this.remotePlayerController.addEventListener(
        cast.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        () => this.handleConnectionChange()
      );
    }
  }

  /**
   * Handle session connection changes
   */
  private sessionListener(session: any): void {
    console.log('Cast session:', session);
    if (session) {
      this.handleConnectionChange();
    }
  }

  /**
   * Handle receiver availability changes
   */
  private receiverListener(availability: string): void {
    console.log('Cast receiver availability:', availability);
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionChange(): void {
    if (this.remotePlayer?.isConnected) {
      const session = this.castContext?.getCurrentSession();
      if (session && this.session?.state !== 'connected') {
        this.session = {
          device: {
            id: session.getSessionId(),
            name: session.getCastDevice()?.friendlyName || 'Chromecast',
            type: 'chromecast',
          },
          state: 'connected',
          videoId: this.session?.videoId || null,
        };
        this.notifyListeners();
      }
    } else if (this.session?.state === 'connected') {
      this.disconnect();
    }
  }

  /**
   * Get available cast devices
   */
  async getAvailableDevices(): Promise<CastDevice[]> {
    const devices: CastDevice[] = [];

    // Check for Chromecast
    if (this.castContext) {
      const castState = this.castContext.getCastState();
      if (castState !== 'NO_DEVICES_AVAILABLE') {
        devices.push({
          id: 'chromecast-default',
          name: 'Cast to TV',
          type: 'chromecast',
        });
      }
    }

    // AirPlay is browser-native on Safari
    if (this.isAirPlayAvailable()) {
      devices.push({
        id: 'airplay-default',
        name: 'AirPlay',
        type: 'airplay',
      });
    }

    return devices;
  }

  /**
   * Check if AirPlay is available (Safari only)
   */
  private isAirPlayAvailable(): boolean {
    // AirPlay is only available in Safari with WebKit
    // However, it requires a native <video> element, not iframes
    // Since we use YouTube iframes, AirPlay won't work directly
    // Users should use Safari's Share Sheet or YouTube's native app for AirPlay
    
    // For now, we'll return false to hide the AirPlay option
    // TODO: Implement native video player if AirPlay is critical
    return false;
    
    /* Original implementation - keeping for reference:
    const videoElement = document.createElement('video');
    return !!(videoElement as any).webkitShowPlaybackTargetPicker;
    */
  }

  /**
   * Connect to a cast device
   */
  async connect(device: CastDevice): Promise<void> {
    this.session = {
      device,
      state: 'connecting',
      videoId: null,
    };
    this.notifyListeners();

    try {
      if (device.type === 'chromecast') {
        await this.connectChromecast();
      } else if (device.type === 'airplay') {
        await this.connectAirPlay();
      }
    } catch (error) {
      this.session = {
        ...this.session,
        state: 'error',
      };
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Connect to Chromecast device
   */
  private async connectChromecast(): Promise<void> {
    if (!this.castContext) {
      throw new Error('Chromecast not initialized');
    }

    return new Promise((resolve, reject) => {
      this.castContext.requestSession().then(
        () => {
          if (this.session) {
            this.session.state = 'connected';
            this.notifyListeners();
          }
          resolve();
        },
        (error: any) => {
          console.error('Failed to connect to Chromecast:', error);
          reject(new Error('Failed to connect to Chromecast'));
        }
      );
    });
  }

  /**
   * Connect to AirPlay device
   */
  private async connectAirPlay(): Promise<void> {
    // For AirPlay, we need to trigger Safari's native picker
    // This requires a video element with the webkitShowPlaybackTargetPicker method
    
    // Find or create a video element to trigger the picker
    let videoElement = document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      // If no video element exists, create a temporary one
      videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
    }
    
    // Check if the method exists
    if (typeof (videoElement as any).webkitShowPlaybackTargetPicker === 'function') {
      try {
        // This opens Safari's native AirPlay device picker
        (videoElement as any).webkitShowPlaybackTargetPicker();
        
        // Listen for the webkitplaybacktargetavailabilitychanged event
        // to know when a device is selected
        const handleAvailabilityChange = (e: Event) => {
          const availability = (e as any).availability;
          if (availability === 'available') {
            if (this.session) {
              this.session.state = 'connected';
              this.notifyListeners();
            }
          }
        };
        
        videoElement.addEventListener('webkitplaybacktargetavailabilitychanged', handleAvailabilityChange, { once: true });
        
        // Note: We can't really track when user cancels the picker,
        // so we'll assume connection after a short delay if picker was shown
        setTimeout(() => {
          if (this.session && this.session.state === 'connecting') {
            // User might have selected a device - we'll assume connected
            // The actual connection state is managed by Safari/WebKit
            this.session.state = 'connected';
            this.notifyListeners();
          }
        }, 1000);
        
      } catch (error) {
        console.error('Failed to show AirPlay picker:', error);
        throw new Error('Failed to open AirPlay device picker');
      }
    } else {
      throw new Error('AirPlay is not available in this browser');
    }
  }

  /**
   * Cast a YouTube video
   */
  async castVideo(videoId: string, title: string, thumbnailUrl: string): Promise<void> {
    if (!this.session || this.session.state !== 'connected') {
      throw new Error('No active cast session');
    }

    if (this.session.device.type === 'chromecast') {
      await this.castToChromecast(videoId, title, thumbnailUrl);
    } else if (this.session.device.type === 'airplay') {
      await this.castToAirPlay(videoId, title);
    }

    this.session.videoId = videoId;
    this.notifyListeners();
  }

  /**
   * Cast to Chromecast device
   */
  private async castToChromecast(videoId: string, title: string, thumbnailUrl: string): Promise<void> {
    const session = this.castContext?.getCurrentSession();
    if (!session) {
      throw new Error('No active Chromecast session');
    }

    const mediaInfo = new (window as any).chrome.cast.media.MediaInfo(
      `https://www.youtube.com/watch?v=${videoId}`,
      'video/mp4'
    );

    mediaInfo.metadata = new (window as any).chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.images = [
      new (window as any).chrome.cast.Image(thumbnailUrl)
    ];

    const request = new (window as any).chrome.cast.media.LoadRequest(mediaInfo);

    return new Promise((resolve, reject) => {
      session.loadMedia(request).then(
        () => {
          console.log('Media loaded on Chromecast');
          resolve();
        },
        (error: any) => {
          console.error('Failed to load media:', error);
          reject(new Error('Failed to cast video'));
        }
      );
    });
  }

  /**
   * Cast to AirPlay device
   */
  private async castToAirPlay(videoId: string, title: string): Promise<void> {
    // For AirPlay, we need to set the video source and let Safari/WebKit handle the rest
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      throw new Error('No video element found for AirPlay casting');
    }

    // Set the YouTube video URL
    // Note: YouTube embeds may need to be used differently for AirPlay
    // This is a simplified implementation - actual YouTube playback via AirPlay
    // requires the video to be playing in the browser first
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // For AirPlay to work with YouTube, the video needs to be playing in the page
    // Safari will then handle casting it to the AirPlay device
    // The user can control this through Safari's native AirPlay controls
    
    console.log(`AirPlay ready for video: ${title} (${youtubeUrl})`);
    
    // Since AirPlay casting is managed by Safari's native controls,
    // we don't need to do much here - the video needs to be playing in the page
    return Promise.resolve();
  }

  /**
   * Play/pause the current video
   */
  async togglePlayPause(): Promise<void> {
    if (!this.session || this.session.state !== 'connected') {
      throw new Error('No active cast session');
    }

    if (this.session.device.type === 'chromecast' && this.remotePlayerController) {
      this.remotePlayerController.playOrPause();
    }
  }

  /**
   * Set volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.session || this.session.state !== 'connected') {
      throw new Error('No active cast session');
    }

    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (this.session.device.type === 'chromecast' && this.remotePlayer) {
      this.remotePlayer.volumeLevel = clampedVolume;
      this.remotePlayerController.setVolumeLevel();
    }
  }

  /**
   * Disconnect from cast device
   */
  disconnect(): void {
    if (this.session?.device.type === 'chromecast' && this.castContext) {
      this.castContext.endCurrentSession(true);
    }

    this.session = null;
    this.notifyListeners();
  }

  /**
   * Get current cast session
   */
  getSession(): CastSession | null {
    return this.session;
  }

  /**
   * Subscribe to session changes
   */
  subscribe(listener: (session: CastSession | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of session changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.session));
  }

  /**
   * Check if casting is available
   */
  isCastAvailable(): boolean {
    return !!(
      (window as any).chrome?.cast ||
      this.isAirPlayAvailable()
    );
  }
}

export const castService = new CastService();

