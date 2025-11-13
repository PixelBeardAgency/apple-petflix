import { castService, CastDevice } from '../cast';

// Mock window.chrome.cast API
const mockCast = {
  framework: {
    CastContext: {
      getInstance: jest.fn(() => ({
        requestSession: jest.fn(),
        getCurrentSession: jest.fn(),
        getCastState: jest.fn(() => 'NOT_AVAILABLE'),
        endCurrentSession: jest.fn(),
      })),
    },
    RemotePlayer: jest.fn(),
    RemotePlayerController: jest.fn(() => ({
      addEventListener: jest.fn(),
      playOrPause: jest.fn(),
      setVolumeLevel: jest.fn(),
    })),
  },
  SessionRequest: jest.fn(),
  ApiConfig: jest.fn(),
  initialize: jest.fn((config, onSuccess) => onSuccess()),
  media: {
    DEFAULT_MEDIA_RECEIVER_APP_ID: 'test-app-id',
    MediaInfo: jest.fn(),
    GenericMediaMetadata: jest.fn(),
    LoadRequest: jest.fn(),
  },
  Image: jest.fn(),
};

describe('Cast Service', () => {
  beforeEach(() => {
    // Setup mock window.chrome.cast
    (global as any).window = {
      chrome: {
        cast: mockCast,
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await castService.initialize();
      expect(mockCast.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      mockCast.initialize.mockImplementation((config, onSuccess, onError) => {
        onError(new Error('Init failed'));
      });

      await expect(castService.initialize()).resolves.not.toThrow();
    });
  });

  describe('getAvailableDevices', () => {
    it('should return empty array when no devices available', async () => {
      const devices = await castService.getAvailableDevices();
      expect(Array.isArray(devices)).toBe(true);
    });

    it('should detect Chromecast devices', async () => {
      const mockContext = mockCast.framework.CastContext.getInstance();
      mockContext.getCastState.mockReturnValue('CONNECTED');

      const devices = await castService.getAvailableDevices();
      expect(devices.length).toBeGreaterThan(0);
      expect(devices[0].type).toBe('chromecast');
    });
  });

  describe('connect', () => {
    it('should connect to Chromecast device', async () => {
      const device: CastDevice = {
        id: 'chromecast-1',
        name: 'Living Room TV',
        type: 'chromecast',
      };

      const mockContext = mockCast.framework.CastContext.getInstance();
      mockContext.requestSession.mockResolvedValue(true);

      await castService.connect(device);
      expect(mockContext.requestSession).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const device: CastDevice = {
        id: 'chromecast-1',
        name: 'Living Room TV',
        type: 'chromecast',
      };

      const mockContext = mockCast.framework.CastContext.getInstance();
      mockContext.requestSession.mockRejectedValue(new Error('Connection failed'));

      await expect(castService.connect(device)).rejects.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from active session', () => {
      castService.disconnect();
      expect(castService.getSession()).toBeNull();
    });
  });

  describe('session management', () => {
    it('should notify listeners on session changes', (done) => {
      const listener = jest.fn((session) => {
        if (listener.mock.calls.length === 1) {
          expect(session).toBeNull();
          done();
        }
      });

      castService.subscribe(listener);
      castService.disconnect();
    });

    it('should unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = castService.subscribe(listener);
      
      unsubscribe();
      castService.disconnect();
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('isCastAvailable', () => {
    it('should return true when cast API is available', () => {
      expect(castService.isCastAvailable()).toBe(true);
    });

    it('should return false when cast API is not available', () => {
      (global as any).window = {};
      expect(castService.isCastAvailable()).toBe(false);
    });
  });
});

