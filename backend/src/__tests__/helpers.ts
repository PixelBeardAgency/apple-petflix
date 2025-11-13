import request from 'supertest';
import { Application } from 'express';

/**
 * Test helper utilities for API testing
 */

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  })),
};

// Mock user for authentication
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {
    username: 'testuser',
  },
};

// Mock moderator user
export const mockModerator = {
  id: '987e4567-e89b-12d3-a456-426614174001',
  email: 'moderator@example.com',
  user_metadata: {
    username: 'moderator',
    role: 'moderator',
  },
};

// Mock JWT token
export const mockToken = 'mock-jwt-token';

/**
 * Make authenticated request
 */
export function authenticatedRequest(
  app: Application,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  token: string = mockToken
) {
  return request(app)[method](url).set('Authorization', `Bearer ${token}`);
}

/**
 * Create mock video data
 */
export function createMockVideo(overrides = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: mockUser.id,
    youtube_video_id: 'dQw4w9WgXcQ',
    title: 'Test Video',
    description: 'Test Description',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    view_count: 1000,
    duration: 'PT3M30S',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock comment data
 */
export function createMockComment(overrides = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    video_id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: mockUser.id,
    content: 'Test comment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock playlist data
 */
export function createMockPlaylist(overrides = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: mockUser.id,
    name: 'Test Playlist',
    description: 'Test playlist description',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock notification data
 */
export function createMockNotification(overrides = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: mockUser.id,
    type: 'follow',
    title: 'New Follower',
    message: 'Someone followed you',
    is_read: false,
    link: '/profile',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Delay helper for async tests
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random UUID for testing
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate random YouTube video ID
 */
export function generateYouTubeVideoId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

