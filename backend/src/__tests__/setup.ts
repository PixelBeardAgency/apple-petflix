// Test setup file
// Runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.YOUTUBE_API_KEY = 'test-youtube-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.VAPID_PUBLIC_KEY = 'test-vapid-public';
process.env.VAPID_PRIVATE_KEY = 'test-vapid-private';
process.env.VAPID_SUBJECT = 'mailto:test@example.com';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
const consoleMock = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

global.console = consoleMock as Console;

