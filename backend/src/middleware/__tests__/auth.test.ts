import { Request, Response, NextFunction } from 'express';
import { authenticateUser, AuthRequest } from '../auth';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should reject requests without authorization header', async () => {
    await authenticateUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No authorization token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should reject requests with invalid token format', async () => {
    mockRequest.headers = {
      authorization: 'InvalidToken',
    };

    await authenticateUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid token format',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should authenticate valid token', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    mockRequest.headers = {
      authorization: 'Bearer validtoken123',
    };

    const { createClient } = require('@supabase/supabase-js');
    const mockSupabase = createClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    await authenticateUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalidtoken',
    };

    const { createClient } = require('@supabase/supabase-js');
    const mockSupabase = createClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    await authenticateUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});

